const { DBSQLClient } = require('@databricks/sql');
const express = require('express');
const cors = require('cors');
require('dotenv').config();


const app = express();
// Enable CORS so your future Vue frontend can communicate with this API
app.use(cors());

const client = new DBSQLClient();

app.get('/api/telemetry', async (req, res) => {
  try {
    await client.connect({
      host: process.env.DATABRICKS_SERVER_HOSTNAME,
      path: process.env.DATABRICKS_HTTP_PATH,
      token: process.env.DATABRICKS_TOKEN
    });
    
    const session = await client.openSession();
    
    const queryOperation = await session.executeStatement(
      'SELECT equipment_id, avg_engine_temperature_celsius, avg_vibration_hz  FROM test_main.iot_stream_data.gold_telemetry_aggregates ORDER BY avg_engine_temperature_celsius DESC'
    );
    
    const result = await queryOperation.fetchAll();
    
    await session.close();
    await client.close();
    
    res.json(result);
  } catch (error) {
    console.error("Databricks Query Error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Render injects the PORT environment variable automatically
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));