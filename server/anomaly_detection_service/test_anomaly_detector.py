import pytest
import pandas as pd
from unittest.mock import MagicMock, patch
from anomaly_detector import run_anomaly_detection, flag_anomalies, fetch_recent_exposures

@pytest.fixture
def mock_db_connection(mocker):
    """Fixture to mock the database connection and cursor."""
    mock_conn = MagicMock()
    mocker.patch('anomaly_detector.get_db_connection', return_value=mock_conn)
    return mock_conn

@pytest.fixture
def sample_data():
    """Fixture to provide sample exposure data."""
    data = {
        'sample_id': [f'id_{i}' for i in range(11)],
        'value': [10, 11, 10, 9, 12, 10, 11, 9, 10, 11, 100], # 100 is the anomaly
        'unit': ['dBA'] * 11
    }
    return pd.DataFrame(data)

def test_anomaly_detection_flags_outlier(mock_db_connection, sample_data, mocker):
    """Test that a clear outlier is correctly identified and flagged."""
    # Mock the function that fetches data to return our sample data
    mocker.patch('anomaly_detector.fetch_recent_exposures', return_value=sample_data)
    
    # Mock the function that flags anomalies so we can check what it was called with
    mock_flag_anomalies = mocker.patch('anomaly_detector.flag_anomalies', return_value=1)

    run_anomaly_detection()

    # Verify that flag_anomalies was called
    mock_flag_anomalies.assert_called_once()
    
    # Check the arguments it was called with
    # The first argument is the connection, the second is the list of anomaly IDs
    args, kwargs = mock_flag_anomalies.call_args
    flagged_ids = args[1]
    
    assert len(flagged_ids) == 1
    assert flagged_ids[0] == 'id_10' # The sample_id of the anomalous value (100)

def test_anomaly_detection_no_outliers(mock_db_connection, mocker):
    """Test that no records are flagged when there are no outliers."""
    # Create data with no outliers
    no_outlier_data = pd.DataFrame({
        'sample_id': [f'id_{i}' for i in range(10)],
        'value': [10, 11, 10, 9, 12, 10, 11, 9, 10, 11],
        'unit': ['dBA'] * 10
    })
    mocker.patch('anomaly_detector.fetch_recent_exposures', return_value=no_outlier_data)
    mock_flag_anomalies = mocker.patch('anomaly_detector.flag_anomalies')

    run_anomaly_detection()

    # Verify that flag_anomalies was not called
    mock_flag_anomalies.assert_not_called()
