import React, { useState, useEffect } from 'react';
import { AlertTriangle, Mountain, Thermometer, Wind, Camera, ExternalLink, RefreshCw, MapPin, TrendingUp, Cloud } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const REGIONS = [
  { id: 'haute-savoie', name: 'Haute-Savoie', lat: 45.9, lon: 6.6 },
  { id: 'savoie', name: 'Savoie', lat: 45.5, lon: 6.5 },
  { id: 'isere', name: 'Isère', lat: 45.2, lon: 6.0 },
  { id: 'hautes-alpes', name: 'Hautes-Alpes', lat: 44.8, lon: 6.3 }
];

const RISK_LEVELS = {
  1: { label: 'Low', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
  2: { label: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' },
  3: { label: 'Considerable', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50' },
  4: { label: 'High', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
  5: { label: 'Very High', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50' }
};

export default function AvalancheDashboard() {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [chartView, setChartView] = useState('7days'); // 7days or 14days

  useEffect(() => {
    fetchWeatherData();
  }, [selectedRegion, chartView]);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const days = chartView === '7days' ? 7 : 14;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const endDateStr = new Date().toISOString().split('T')[0];
      const startDateStr = startDate.toISOString().split('T')[0];

      // Fetch current + forecast data
      const currentResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${selectedRegion.lat}&longitude=${selectedRegion.lon}&current=temperature_2m,windspeed_10m,snowfall,weather_code&daily=temperature_2m_max,temperature_2m_min,snowfall_sum,precipitation_sum&timezone=Europe/Paris&forecast_days=7`
      );
      const currentData = await currentResponse.json();
      setWeatherData(currentData);

      // Fetch historical data
      const historicalResponse = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${selectedRegion.lat}&longitude=${selectedRegion.lon}&start_date=${startDateStr}&end_date=${endDateStr}&daily=temperature_2m_max,temperature_2m_min,snowfall_sum,precipitation_sum&timezone=Europe/Paris`
      );
      const histData = await historicalResponse.json();
      
      // Format data for charts
      const formattedData = histData.daily.time.map((date, idx) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date,
        tempMax: Math.round(histData.daily.temperature_2m_max[idx]),
        tempMin: Math.round(histData.daily.temperature_2m_min[idx]),
        snowfall: histData.daily.snowfall_sum[idx] || 0,
        precipitation: histData.daily.precipitation_sum[idx] || 0
      }));

      setHistoricalData(formattedData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
    setLoading(false);
  };

  // Simulated avalanche forecast data
  const avalancheForecast = {
    riskLevel: Math.floor(Math.random() * 3) + 2,
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
    summary: "Recent snowfall and rising temperatures have increased avalanche risk. Wind-loaded slopes above 2000m are particularly vulnerable. Natural avalanche activity is possible.",
    problems: [
      { type: "Wind Slab", elevation: "Above 2000m", aspects: ["N", "NE", "E"] },
      { type: "Wet Snow", elevation: "Below 2500m", aspects: ["All"] }
    ]
  };

  const webcams = [
    { name: "Aiguille du Midi", url: "https://www.chamonix.com/webcams" },
    { name: "Col du Galibier", url: "https://www.valdisere.com/webcams" },
    { name: "Les Deux Alpes", url: "https://www.les2alpes.com/webcams" }
  ];

  const riskInfo = RISK_LEVELS[avalancheForecast.riskLevel];

  // Calculate total snowfall for the period
  const totalSnowfall = historicalData.reduce((sum, day) => sum + day.snowfall, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Mountain className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-800">French Alps Avalanche Monitor</h1>
            </div>
            <button
              onClick={fetchWeatherData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {/* Region Selector */}
          <div className="flex gap-2 flex-wrap">
            {REGIONS.map(region => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedRegion.id === region.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <MapPin className="w-4 h-4 inline mr-1" />
                {region.name}
              </button>
            ))}
          </div>
          
          <p className="text-sm text-slate-500 mt-4">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        {/* Avalanche Forecast */}
        <div className={`${riskInfo.bgLight} border-l-4 ${riskInfo.color} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-start gap-4">
            <AlertTriangle className={`w-12 h-12 ${riskInfo.textColor} flex-shrink-0`} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-slate-800">Avalanche Forecast</h2>
                <span className={`px-4 py-2 ${riskInfo.color} text-white rounded-lg font-bold text-lg`}>
                  Level {avalancheForecast.riskLevel} - {riskInfo.label}
                </span>
              </div>
              
              <p className="text-slate-700 mb-4 leading-relaxed">
                {avalancheForecast.summary}
              </p>
              
              <div className="bg-white rounded-lg p-4 mb-3">
                <h3 className="font-semibold text-slate-800 mb-2">Avalanche Problems:</h3>
                {avalancheForecast.problems.map((problem, idx) => (
                  <div key={idx} className="mb-2 last:mb-0">
                    <span className="font-medium text-slate-700">{problem.type}</span>
                    <span className="text-slate-600"> - {problem.elevation}</span>
                    <span className="text-slate-500 text-sm ml-2">
                      Aspects: {problem.aspects.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>Valid until: {avalancheForecast.validUntil}</span>
                <a 
                  href="https://meteofrance.com/meteo-montagne" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Official Forecast <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Weather Charts */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Weather History & Trends
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setChartView('7days')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  chartView === '7days'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartView('14days')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  chartView === '14days'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                14 Days
              </button>
            </div>
          </div>

          {historicalData.length > 0 ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Total Snowfall</p>
                  <p className="text-2xl font-bold text-blue-600">{totalSnowfall.toFixed(1)} cm</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Avg High</p>
                  <p className="text-2xl font-bold text-slate-700">
                    {(historicalData.reduce((sum, d) => sum + d.tempMax, 0) / historicalData.length).toFixed(1)}°C
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Avg Low</p>
                  <p className="text-2xl font-bold text-slate-700">
                    {(historicalData.reduce((sum, d) => sum + d.tempMin, 0) / historicalData.length).toFixed(1)}°C
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Snow Days</p>
                  <p className="text-2xl font-bold text-slate-700">
                    {historicalData.filter(d => d.snowfall > 0).length}
                  </p>
                </div>
              </div>

              {/* Temperature Chart */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-800 mb-3">Temperature Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                    />
                    <YAxis 
                      label={{ value: '°C', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="tempMax" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="High"
                      dot={{ fill: '#ef4444', r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tempMin" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Low"
                      dot={{ fill: '#3b82f6', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Snowfall Chart */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Snowfall Accumulation
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                    />
                    <YAxis 
                      label={{ value: 'cm', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="snowfall" 
                      stroke="#06b6d4" 
                      fill="#67e8f9"
                      strokeWidth={2}
                      name="Daily Snowfall (cm)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Loading historical data...
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Weather Data */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Thermometer className="w-6 h-6 text-blue-600" />
              Current Weather
            </h2>
            
            {weatherData && weatherData.current ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Temperature</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {Math.round(weatherData.current.temperature_2m)}°C
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium flex items-center gap-2">
                    <Wind className="w-5 h-5" />
                    Wind Speed
                  </span>
                  <span className="text-xl font-bold text-slate-700">
                    {Math.round(weatherData.current.windspeed_10m)} km/h
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Snowfall (current)</span>
                  <span className="text-xl font-bold text-slate-700">
                    {weatherData.current.snowfall || 0} cm
                  </span>
                </div>

                {weatherData.daily && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-slate-800 mb-2">Next 24 Hours</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">High/Low:</span>
                        <span className="font-medium">
                          {Math.round(weatherData.daily.temperature_2m_max[0])}°C / 
                          {Math.round(weatherData.daily.temperature_2m_min[0])}°C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Expected Snowfall:</span>
                        <span className="font-medium">
                          {weatherData.daily.snowfall_sum[0] || 0} cm
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                Loading weather data...
              </div>
            )}
          </div>

          {/* Webcams */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Camera className="w-6 h-6 text-blue-600" />
              Live Webcams
            </h2>
            
            <div className="space-y-3">
              {webcams.map((cam, idx) => (
                <a
                  key={idx}
                  href={cam.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 group-hover:text-blue-600">
                      {cam.name}
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  </div>
                </a>
              ))}
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">
                  <strong>Note:</strong> Live webcam feeds are provided by resort and weather station operators.
                </p>
                <a
                  href="https://www.chamonix.com/webcams"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  Browse all Chamonix webcams <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sources & Disclaimer */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Information</h3>
          <p className="text-sm text-yellow-700 mb-2">
            This is a demonstration dashboard. For actual backcountry travel, always consult:
          </p>
          <ul className="text-sm text-yellow-700 space-y-1 ml-4">
            <li>• <a href="https://meteofrance.com/meteo-montagne" target="_blank" rel="noopener noreferrer" className="underline">Météo-France Mountain Forecasts</a></li>
            <li>• <a href="https://www.data-avalanche.org/" target="_blank" rel="noopener noreferrer" className="underline">Data Avalanche (ANENA)</a></li>
            <li>• Local mountain guides and ski patrol services</li>
          </ul>
          <p className="text-sm text-yellow-700 mt-2">
            Weather data provided by Open-Meteo API. Never travel in avalanche terrain without proper training, equipment, and current local knowledge.
          </p>
        </div>
      </div>
    </div>
  );
}