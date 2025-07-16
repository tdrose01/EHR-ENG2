import pytest
from unittest.mock import MagicMock, patch
from retention_policy_manager import apply_retention_policies

@pytest.fixture
def mock_db_connection(mocker):
    """Fixture to mock the database connection and cursor."""
    mock_conn = MagicMock()
    mock_cur = MagicMock()
    mocker.patch('retention_policy_manager.get_db_connection', return_value=mock_conn)
    mock_conn.cursor.return_value.__enter__.return_value = mock_cur
    return mock_conn, mock_cur

def test_apply_retention_policies(mock_db_connection, mocker):
    """Test that the correct DELETE statements are executed."""
    mock_conn, mock_cur = mock_db_connection
    
    # Mock the config values to be predictable
    mocker.patch('retention_policy_manager.RAW_DATA_RETENTION_YEARS', 5)
    mocker.patch('retention_policy_manager.AGGREGATE_DATA_RETENTION_YEARS', 10)

    apply_retention_policies(mock_conn)

    # Check that execute was called for each deletion task
    assert mock_cur.execute.call_count == 3 # 1 for raw, 2 for aggregates

    # Check the raw data deletion call
    raw_delete_call = mock_cur.execute.call_args_list[0][0][0]
    assert "DELETE FROM exposures" in raw_delete_call
    assert "INTERVAL '5 years'" in raw_delete_call

    # Check the aggregate data deletion calls
    agg_delete_call_1 = mock_cur.execute.call_args_list[1][0][0]
    assert "DELETE FROM hourly_air_quality_summary" in agg_delete_call_1
    assert "INTERVAL '10 years'" in agg_delete_call_1

    agg_delete_call_2 = mock_cur.execute.call_args_list[2][0][0]
    assert "DELETE FROM hourly_heat_stress_summary" in agg_delete_call_2
    assert "INTERVAL '10 years'" in agg_delete_call_2

    # Check that commit was called
    mock_conn.commit.assert_called_once()
