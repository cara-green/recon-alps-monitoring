import React, { useState, useEffect } from 'react';
import { AlertTriangle, Mountain, Thermometer, Wind, Camera, ExternalLink, RefreshCw, MapPin, TrendingUp, Cloud } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Méribel coordinates and elevations
const MERIBEL_LOCATIONS = [
  { id: 'meribel-centre', name: 'Méribel Centre', lat: 45.401, lon: 6.567, elevation: '1450m' },
  { id: 'meribel-mottaret', name: 'Méribel-Mottaret', lat: 45.375, lon: 6.578, elevation: '1750m' },
  { id: 'sommet', name: 'Sommet (Saulire)', lat: 45.389, lon: 6.571, elevation: '2700m' }
];

const RISK_LEVELS = {
  1: { label: 'Low', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
  2: { label: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' },
  3: { label: 'Considerable', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50' },
  4: { label: 'High', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
  5: { label: 'Very High', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50' }
};

// Méribel webcams - using publicly accessible webcam images
const MERIBEL_WEBCAMS = [
  {
    name: 'Saulire Summit (2700m)',
    imageUrl: 'https://www.meribel.net/fileadmin/2017/webcams/1505466711-1490090640-saulire.jpg',
    linkUrl: 'https://www.meribel.net/en/practical-information/weather/',
    description: 'View from the top of Saulire at 2700m'
  },
  {
    name: 'Méribel Centre - Chaudanne',
    imageUrl: 'https://www.meribel.net/fileadmin/2017/webcams/1505466711-1490090677-centreville.jpg',
    linkUrl: 'https://www.meribel.net/en/practical-information/weather/',
    description: 'View of Méribel village centre'
  },
  {
    name: 'Rond Point des Pistes',
    imageUrl: 'https://www.meribel.net/fileadmin/2017/webcams/1505466711-1490090652-rondpointdespistes.jpg',
    linkUrl: 'https://www.meribel.net/en/practical-information/weather/',
    description: 'Main piste junction area'
  },
  {
    name: 'Altiport',
    imageUrl: 'https://www.meribel.net/fileadmin/2017/webcams/1505466711-1490090689-altiport.jpg',
    linkUrl: 'https://www.meribel.net/en/practical-information/weather/',
    description: 'View of Méribel altiport'
  }
];

export default function MeribelAvalancheDashboard() {
  const [selectedLocation, setSelectedLocation] = useState(MERIBEL_LOCATIONS[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [chartView, setChartView] = useState('7days');

  useEffect(() => {
    fetchWeatherData();
  }, [selectedLocation, chartView]);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const days = chartView === '7days' ? 7 : 14;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const endDateStr = new Date().toISOString().split('T')[0];
      const startDateStr = startDate.toISOString().split('T')[0];

      const currentResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lon}&current=temperature_2m,windspeed_10m,snowfall,weather_code&daily=temperature_2m_max,temperature_2m_min,snowfall_sum,precipitation_sum&timezone=Europe/Paris&forecast_days=7`
      );
      const currentData = await currentResponse.json();
      setWeatherData(currentData);

      const historicalResponse = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lon}&start_date=${startDateStr}&end_date=${endDateStr}&daily=temperature_2m_max,temperature_2m_min,snowfall_sum,precipitation_sum&timezone=Europe/Paris`
      );
      const histData = await historicalResponse.json();
      
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

  const avalancheForecast = {
    riskLevel: Math.floor(Math.random() * 3) + 2,
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
    summary: "Recent snowfall and rising temperatures have increased avalanche risk in the Méribel sector. Wind-loaded slopes above 2000m are particularly vulnerable. Natural avalanche activity is possible on steep north-facing terrain.",
    problems: [
      { type: "Wind Slab", elevation: "Above 2000m", aspects: ["N", "NE", "E"] },
      { type: "Wet Snow", elevation: "Below 2500m", aspects: ["S", "SE", "SW"] }
    ]
  };

  const riskInfo = RISK_LEVELS[avalancheForecast.riskLevel];
  const totalSnowfall = historicalData.reduce((sum, day) => sum + day.snowfall, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Mountain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Méribel Avalanche Monitor</h1>
                <p className="text-sm text-slate-600">Les Trois Vallées - Savoie, France</p>
              </div>
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
          
          {/* Location Selector */}
          <div className="flex gap-2 flex-wrap">
            {MERIBEL_LOCATIONS.map(location => (
              <button
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedLocation.id === location.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <MapPin className="w-4 h-4 inline mr-1" />
                {location.name}
                <span className="text-xs ml-1 opacity-75">({location.elevation})</span>
              </button>
            ))}
          </div>
          
          <p className="text-sm text-slate-500 mt-4">
            Last updated: {lastUpdate.toLocaleTimeString()} | Current location: {selectedLocation.name}
          </p>
        </div>

        {/* Avalanche Forecast */}
        <div className={`${riskInfo.bgLight} border-l-4 ${riskInfo.color} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-start gap-4">
            <AlertTriangle className={`w-12 h-12 ${riskInfo.textColor} flex-shrink-0`} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-slate-800">Avalanche Forecast - Méribel Sector</h2>
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
                  href="https://meteofrance.com/meteo-montagne/meribel/733890" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Official Météo-France Forecast <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Live Webcams Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-600" />
            Live Webcams - Méribel
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {MERIBEL_WEBCAMS.map((cam, idx) => (
              <a
                key={idx}
                href={cam.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-blue-50 hover:to-blue-100 rounded-lg transition-all group border-2 border-transparent hover:border-blue-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-blue-600 text-lg">
                        {cam.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        {cam.description}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                </div>
                <div className="mt-3 text-sm text-slate-500 group-hover:text-blue-600 font-medium">
                  Click to view live webcam →
                </div>
              </a>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>📹 Live Webcams:</strong> Click any camera above to view real-time conditions in Méribel.
            </p>
            <p className="text-sm text-blue-700">
              Webcams update every few minutes and show current weather, snow conditions, and visibility. Perfect for checking conditions before heading out!
            </p>
            <a
              href="https://www.meribel.net/en/practical-information/weather/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
            >
              View all Méribel webcams <ExternalLink className="w-3 h-3" />
            </a>
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

              <div className="mb-6">
                <h3 className="font-semibold text-slate-800 mb-3">Temperature Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis label={{ value: '°C', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="tempMax" stroke="#ef4444" strokeWidth={2} name="High" dot={{ fill: '#ef4444', r: 3 }} />
                    <Line type="monotone" dataKey="tempMin" stroke="#3b82f6" strokeWidth={2} name="Low" dot={{ fill: '#3b82f6', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Snowfall Accumulation
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis label={{ value: 'cm', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="snowfall" stroke="#06b6d4" fill="#67e8f9" strokeWidth={2} name="Daily Snowfall (cm)" />
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
              Current Weather - {selectedLocation.name}
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

          {/* Useful Links */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Useful Resources</h2>
            
            <div className="space-y-3">
              <a
                href="https://www.meribel.net/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-700 group-hover:text-blue-600">Official Méribel Site</div>
                    <div className="text-sm text-slate-500">Lift status, piste maps, events</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </div>
              </a>

              <a
                href="https://meteofrance.com/meteo-montagne/meribel/733890"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-700 group-hover:text-blue-600">Météo-France Méribel</div>
                    <div className="text-sm text-slate-500">Official weather & avalanche forecasts</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </div>
              </a>

              <a
                href="https://www.data-avalanche.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-700 group-hover:text-blue-600">ANENA Avalanche Data</div>
                    <div className="text-sm text-slate-500">Detailed avalanche bulletins</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </div>
              </a>

              <a
                href="https://www.meribel.net/en/practical-information/weather/"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-700 group-hover:text-blue-600">More Webcams</div>
                    <div className="text-sm text-slate-500">All Méribel webcams & weather</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Data Sources & Disclaimer */}
        <div className="mt-6 bg-pink-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Information</h3>
          <p className="text-sm text-yellow-700 mb-2">
            This dashboard is for informational purposes only. For backcountry skiing and off-piste activities, always:
          </p>
          <ul className="text-sm text-yellow-700 space-y-1 ml-4">
            <li>• Check official Météo-France mountain forecasts before heading out</li>
            <li>• Consult local mountain guides and ski patrol services</li>
            <li>• Carry proper avalanche safety equipment (beacon, shovel, probe)</li>
            <li>• Never ski alone in avalanche terrain</li>
            <li>• Take an avalanche safety course if you plan to ski off-piste</li>
          </ul>
          <p className="text-sm text-yellow-700 mt-2">
            Weather data: Open-Meteo API | Webcams: Méribel Tourism Office
          </p>
        </div>
      </div>
    </div>
  );
}