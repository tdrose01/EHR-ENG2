# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: noise_dosimeter.proto
# Protobuf Python Version: 6.31.0
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import runtime_version as _runtime_version
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
_runtime_version.ValidateProtobufRuntimeVersion(
    _runtime_version.Domain.PUBLIC,
    6,
    31,
    0,
    '',
    'noise_dosimeter.proto'
)
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from google.protobuf import timestamp_pb2 as google_dot_protobuf_dot_timestamp__pb2


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x15noise_dosimeter.proto\x12\x0enoisedosimeter\x1a\x1fgoogle/protobuf/timestamp.proto\"\xf9\x01\n\x10NoiseDataRequest\x12\x11\n\tdevice_id\x18\x01 \x01(\t\x12\x15\n\rlocation_code\x18\x02 \x01(\t\x12\x31\n\rtimestamp_utc\x18\x03 \x01(\x0b\x32\x1a.google.protobuf.Timestamp\x12\x13\n\x0b\x63\x61ptured_by\x18\x04 \x01(\t\x12\x1e\n\x16\x64osimeter_interval_min\x18\x05 \x01(\x01\x12\x0c\n\x04laeq\x18\x06 \x01(\x01\x12\x0f\n\x07peak_db\x18\x07 \x01(\x01\x12\x34\n\x10\x63\x61libration_date\x18\x08 \x01(\x0b\x32\x1a.google.protobuf.Timestamp\"H\n\x11NoiseDataResponse\x12\x0f\n\x07success\x18\x01 \x01(\x08\x12\x0f\n\x07message\x18\x02 \x01(\t\x12\x11\n\tsample_id\x18\x03 \x01(\t2j\n\x0eNoiseDosimeter\x12X\n\x0fUploadNoiseData\x12 .noisedosimeter.NoiseDataRequest\x1a!.noisedosimeter.NoiseDataResponse\"\x00\x62\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'noise_dosimeter_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_NOISEDATAREQUEST']._serialized_start=75
  _globals['_NOISEDATAREQUEST']._serialized_end=324
  _globals['_NOISEDATARESPONSE']._serialized_start=326
  _globals['_NOISEDATARESPONSE']._serialized_end=398
  _globals['_NOISEDOSIMETER']._serialized_start=400
  _globals['_NOISEDOSIMETER']._serialized_end=506
# @@protoc_insertion_point(module_scope)
