const express = require('express');
const router = express.Router();

// Overview summary
router.get('/overview', async (req, res) => {
  res.json({
    location: "USS Ronald Reagan, NAS Pensacola",
    unit: "VAQ-139",
    personnelMonitored: 125,
    incidentsThisMonth: 2,
    pendingTests: 8,
    recentAlerts: "Elevated BLLs in 2 personnel"
  });
});

// Exposure events
router.get('/exposure-events', async (req, res) => {
  res.json([
    {
      date: "2025-06-20",
      event: "Burn Pit Smoke",
      type: "Airborne Particulate",
      location: "Al Udeid AB",
      exposure_level: "High",
      affected_personnel: 14,
      status: "Monitoring"
    },
    {
      date: "2025-05-15",
      event: "Noise > 85dB",
      type: "Acoustic",
      location: "Shipboard Engine Room",
      exposure_level: "Moderate",
      affected_personnel: 6,
      status: "Audiograms Ordered"
    }
  ]);
});

// Biological test results
router.get('/bio-tests', async (req, res) => {
  res.json([
    {
      name: "SNM, John",
      test_type: "Blood Lead Level",
      sample_date: "2025-06-22",
      result: "12 µg/dL",
      reference_range: "<5 µg/dL",
      status: "Flagged"
    },
    {
      name: "SMN, Ashley",
      test_type: "Urinary Mercury",
      sample_date: "2025-06-21",
      result: "1.5 µg/g creatinine",
      reference_range: "<5 µg/g",
      status: "Normal"
    }
  ]);
});

// Medical surveillance compliance
router.get('/med-surveillance', async (req, res) => {
  res.json([
    {
      personnel: "HM2 Garcia",
      nec: "8404",
      required_exam: "Asbestos Medical Exam",
      last_exam: "2024-11-12",
      next_due: "2025-11-12",
      compliant: true
    },
    {
      personnel: "EN3 Ramos",
      nec: "4231",
      required_exam: "Hearing Conservation",
      last_exam: "2025-01-01",
      next_due: "2026-01-01",
      compliant: true
    }
  ]);
});

// Deployment environmental logs
router.get('/deployment-logs', async (req, res) => {
  res.json([
    {
      deployment: "CENTCOM",
      dates: "Jan–May 2025",
      exposure_type: "VOCs, PM10",
      monitoring_type: "Air Samples, Biomarkers",
      results_available: true
    }
  ]);
});

module.exports = router; 