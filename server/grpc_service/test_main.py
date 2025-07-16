import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
import grpc

# Add the service directory to the path to allow imports
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Import the generated protobuf classes and the servicer
import noise_dosimeter_pb2
from main import NoiseDosimeterServicer

@pytest.fixture
def servicer():
    """Fixture to create an instance of the servicer."""
    return NoiseDosimeterServicer()

@pytest.fixture
def mock_db_connection(mocker):
    """Fixture to mock the database connection and cursor."""
    mock_conn = MagicMock()
    mock_cur = MagicMock()
    mocker.patch('main.get_db_connection', return_value=mock_conn)
    mock_conn.cursor.return_value.__enter__.return_value = mock_cur
    return mock_conn, mock_cur

@pytest.fixture
def mock_context():
    """Fixture to create a mock gRPC context."""
    return MagicMock(spec=grpc.ServicerContext)

def test_upload_noise_data_success(servicer, mock_db_connection, mock_context):
    """Test successful data upload."""
    mock_conn, mock_cur = mock_db_connection
    
    # Create a request with a recent calibration date
    request = noise_dosimeter_pb2.NoiseDataRequest(
        device_id='test-device-01',
        location_code='test-location',
        captured_by='test-user',
        laeq=85.5,
        peak_db=110.0,
        calibration_date=noise_dosimeter_pb2.google_dot_protobuf_dot_timestamp__pb2.Timestamp()
    )
    request.calibration_date.FromDatetime(datetime.utcnow() - timedelta(days=30))
    request.timestamp_utc.FromDatetime(datetime.utcnow())

    response = servicer.UploadNoiseData(request, mock_context)

    assert response.success is True
    assert "successfully uploaded" in response.message
    assert mock_cur.execute.call_count == 2 # One for exposures, one for noise_details
    mock_conn.commit.assert_called_once()

def test_upload_noise_data_expired_calibration(servicer, mock_db_connection, mock_context):
    """Test rejection of data with an expired calibration date."""
    mock_conn, mock_cur = mock_db_connection

    request = noise_dosimeter_pb2.NoiseDataRequest(
        device_id='test-device-02',
        calibration_date=noise_dosimeter_pb2.google_dot_protobuf_dot_timestamp__pb2.Timestamp()
    )
    request.calibration_date.FromDatetime(datetime.utcnow() - timedelta(days=200))

    response = servicer.UploadNoiseData(request, mock_context)

    assert response.success is False
    assert "expired" in response.message
    mock_context.set_code.assert_called_with(grpc.StatusCode.INVALID_ARGUMENT)
    mock_cur.execute.assert_not_called() # Should not attempt to insert data
    mock_conn.commit.assert_not_called()

def test_upload_noise_data_db_error(servicer, mock_db_connection, mock_context):
    """Test handling of a database insertion error."""
    mock_conn, mock_cur = mock_db_connection
    mock_cur.execute.side_effect = Exception("DB write error")

    request = noise_dosimeter_pb2.NoiseDataRequest(
        device_id='test-device-03',
        calibration_date=noise_dosimeter_pb2.google_dot_protobuf_dot_timestamp__pb2.Timestamp()
    )
    request.calibration_date.FromDatetime(datetime.utcnow() - timedelta(days=10))

    response = servicer.UploadNoiseData(request, mock_context)

    assert response.success is False
    assert "Database insert failed" in response.message
    mock_context.set_code.assert_called_with(grpc.StatusCode.INTERNAL)
    mock_conn.rollback.assert_called_once()
