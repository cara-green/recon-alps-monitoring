import MeribelLogo from './components/MeribelLogo';
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Mountain, Thermometer, Wind, Camera, ExternalLink, RefreshCw, MapPin, TrendingUp, Cloud, ChevronDown, ChevronUp, Calendar, Snowflake } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MERIBEL_LOCATIONS = [
  { id: 'meribel-centre', name: 'Méribel Centre', lat: 45.401, lon: 6.567, elevation: '1450m' },
  { id: 'meribel-mottaret', name: 'Méribel-Mottaret', lat: 45.375, lon: 6.578, elevation: '1750m' },
  { id: 'sommet', name: 'Sommet (Saulire)', lat: 45.389, lon: 6.571, elevation: '2700m' }
];

const MERIBEL_WEBCAMS = [
  { name: 'Saulire Summit (2700m)', linkUrl: 'https://www.meribel.net/en/practical-information/weather/', description: 'View from the top of Saulire at 2700m' },
  { name: 'Méribel Centre - Chaudanne', linkUrl: 'https://www.meribel.net/en/practical-information/weather/', description: 'View of Méribel village centre' },
  { name: 'Rond Point des Pistes', linkUrl: 'https://www.meribel.net/en/practical-information/weather/', description: 'Main piste junction area' },
  { name: 'Altiport', linkUrl: 'https://www.meribel.net/en/practical-information/weather/', description: 'View of Méribel altiport' }
];

const API_BASE_URL = 'https://meribel-api-production.up.railway.app';

export default function MeribelAvalancheDashboard() {
  const [selectedLocation, setSelectedLocation] = useState(MERIBEL_LOCATIONS[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [avalancheBulletin, setAvalancheBulletin] = useState(null);
  const [weatherWarnings, setWeatherWarnings] = useState(null);
  const [extendedForecast, setExtendedForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [chartView, setChartView] = useState('7days');
  const [forecastRange, setForecastRange] = useState('7day');
  const [expandedDay, setExpandedDay] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    elevation: false,
    problems: true,
    snowpack: false,
    weather: false
  });

  useEffect(() => {
    fetchWeatherData();
    fetchAvalancheData();
    fetchWeatherWarnings();
    fetchExtendedForecast();
  }, [selectedLocation, chartView]);

  useEffect(() => {
    fetchExtendedForecast();
  }, [selectedLocation, forecastRange]);

  const fetchAvalancheData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/avalanche/vanoise`);
      const data = await response.json();
      setAvalancheBulletin(data);
    } catch (error) {
      console.error('Error fetching avalanche data:', error);
    }
  };

  const fetchWeatherWarnings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/warnings/savoie`);
      const data = await response.json();
      setWeatherWarnings(data);
    } catch (error) {
      console.error('Error fetching weather warnings:', error);
    }
  };

  const fetchExtendedForecast = async () => {
    setForecastLoading(true);
    try {
      const days = forecastRange === '7day' ? 7 : 16;
      const response = await fetch(
        `${API_BASE_URL}/api/forecast/extended?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}&days=${days}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      
      const data = await response.json();
      setExtendedForecast(data);
    } catch (err) {
      console.error('Error fetching extended forecast:', err);
      setExtendedForecast(null);
    } finally {
      setForecastLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getRiskColor = (level) => {
    const colors = {
      1: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', badge: 'bg-green-500' },
      2: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-700', badge: 'bg-yellow-500' },
      3: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700', badge: 'bg-orange-500' },
      4: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', badge: 'bg-red-500' },
      5: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', badge: 'bg-purple-500' }
    };
    return colors[level] || colors[3];
  };

  const getForecastRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'considerable': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAlertColor = (level) => {
    const colors = {
      green: 'bg-green-100 border-green-400 text-green-800',
      yellow: 'bg-yellow-100 border-yellow-400 text-yellow-800',
      orange: 'bg-orange-100 border-orange-400 text-orange-800',
      red: 'bg-red-100 border-red-400 text-red-800'
    };
    return colors[level] || colors.yellow;
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const days = chartView === '7days' ? 7 : 14;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const endDateStr = new Date().toISOString().split('T')[0];
      const startDateStr = startDate.toISOString().split('T')[0];

      const currentResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lon}&current=temperature_2m,windspeed_10m,snowfall,weather_code&daily=temperature_2m_max,temperature_2m_min,snowfall_sum,precipitation_sum&timezone=Europe/Paris&forecast_days=7`);
      const currentData = await currentResponse.json();
      setWeatherData(currentData);

      const historicalResponse = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lon}&start_date=${startDateStr}&end_date=${endDateStr}&daily=temperature_2m_max,temperature_2m_min,snowfall_sum,precipitation_sum&timezone=Europe/Paris`);
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

  const totalSnowfall = historicalData.reduce((sum, day) => sum + day.snowfall, 0);

  const sevenDayForecast = extendedForecast?.daily?.slice(0, 7) || [];
  const sixteenDayOverview = extendedForecast?.daily || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
       <MeribelLogo size={128} className="text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Méribel Avalanche Monitor</h1>
                <p className="text-sm text-slate-600">Les Trois Vallées - Savoie, France</p>
              </div>
            </div>
            <button onClick={() => { fetchWeatherData(); fetchAvalancheData(); fetchWeatherWarnings(); fetchExtendedForecast(); }} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {MERIBEL_LOCATIONS.map(location => (
              <button key={location.id} onClick={() => setSelectedLocation(location)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedLocation.id === location.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                <MapPin className="w-4 h-4 inline mr-1" />
                {location.name} ({location.elevation})
              </button>
            ))}
          </div>
          
          <p className="text-sm text-slate-500 mt-4">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>

        {weatherWarnings && weatherWarnings.alerts && weatherWarnings.alerts.length > 0 && (
          <div className={`border-l-4 rounded-lg shadow-md p-4 mb-6 ${getAlertColor(weatherWarnings.alerts[0].level)}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold mb-1">Weather Warning: {weatherWarnings.alerts[0].type}</h3>
                <p className="text-sm">{weatherWarnings.alerts[0].description}</p>
              </div>
            </div>
          </div>
        )}

        {avalancheBulletin && (
          <div className={`${getRiskColor(avalancheBulletin.overallRisk).bg} border-l-4 ${getRiskColor(avalancheBulletin.overallRisk).border} rounded-lg shadow-lg p-6 mb-6`}>
            <div className="flex items-start gap-4">
              <AlertTriangle className={`w-12 h-12 ${getRiskColor(avalancheBulletin.overallRisk).text} flex-shrink-0`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-bold text-slate-800">Avalanche Forecast - Vanoise Massif</h2>
                  <span className={`px-4 py-2 ${getRiskColor(avalancheBulletin.overallRisk).badge} text-white rounded-lg font-bold text-lg`}>
                    Level {avalancheBulletin.overallRisk}/5
                  </span>
                </div>
                
                <p className="text-slate-700 mb-4 leading-relaxed">{avalancheBulletin.summary}</p>
                
                <div className="bg-white rounded-lg p-4 mb-3 cursor-pointer" onClick={() => toggleSection('elevation')}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">Risk by Elevation</h3>
                    {expandedSections.elevation ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                  {expandedSections.elevation && avalancheBulletin.elevationBands && (
                    <div className="mt-3 space-y-2">
                      {avalancheBulletin.elevationBands.map((band, idx) => (
                        <div key={idx} className="border-l-2 border-slate-300 pl-3">
                          <div className="font-medium text-slate-700">{band.elevation}: Level {band.risk}/5</div>
                          <div className="text-sm text-slate-600">{band.description}</div>
                          <div className="text-xs text-slate-500 mt-1">Critical aspects: {band.aspects.join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4 mb-3 cursor-pointer" onClick={() => toggleSection('problems')}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">Avalanche Problems</h3>
                    {expandedSections.problems ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                  {expandedSections.problems && avalancheBulletin.problems && (
                    <div className="mt-3 space-y-3">
                      {avalancheBulletin.problems.map((problem, idx) => (
                        <div key={idx} className="border-l-2 border-orange-300 pl-3">
                          <div className="font-medium text-slate-700">{problem.icon} {problem.type}</div>
                          <div className="text-sm text-slate-600 mt-1">
                            <span className="font-medium">Severity:</span> {problem.severity}
                          </div>
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Distribution:</span> {problem.distribution}
                          </div>
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Sensitivity:</span> {problem.sensitivity}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4 mb-3 cursor-pointer" onClick={() => toggleSection('snowpack')}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">Snowpack Information</h3>
                    {expandedSections.snowpack ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                  {expandedSections.snowpack && avalancheBulletin.snowpack && (
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <div><span className="font-medium">Recent Snow:</span> {avalancheBulletin.snowpack.recentSnow}</div>
                      <div><span className="font-medium">Total Depth:</span> {avalancheBulletin.snowpack.totalDepth}</div>
                      <div><span className="font-medium">Quality:</span> {avalancheBulletin.snowpack.quality}</div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4 cursor-pointer" onClick={() => toggleSection('weather')}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">Weather & Tendency</h3>
                    {expandedSections.weather ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                  {expandedSections.weather && avalancheBulletin.weather && (
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <div><span className="font-medium">Forecast:</span> {avalancheBulletin.weather.forecast}</div>
                      <div><span className="font-medium">Temperature:</span> {avalancheBulletin.weather.temperature}</div>
                      <div><span className="font-medium">Wind:</span> {avalancheBulletin.weather.wind}</div>
                      {avalancheBulletin.tendency && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <span className="font-medium">Tendency:</span> {avalancheBulletin.tendency}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-600 mt-4">
                  <span>Valid until: {avalancheBulletin.validUntil}</span>
                  <a href={avalancheBulletin.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium">
                    View Official Bulletin <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {avalancheBulletin.note && (
                  <p className="text-xs text-slate-600 mt-2 italic">{avalancheBulletin.note}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />Weather History
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setChartView('7days')} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${chartView === '7days' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>7 Days</button>
              <button onClick={() => setChartView('14days')} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${chartView === '14days' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>14 Days</button>
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
                  <p className="text-2xl font-bold text-slate-700">{(historicalData.reduce((sum, d) => sum + d.tempMax, 0) / historicalData.length).toFixed(1)}°C</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Avg Low</p>
                  <p className="text-2xl font-bold text-slate-700">{(historicalData.reduce((sum, d) => sum + d.tempMin, 0) / historicalData.length).toFixed(1)}°C</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Snow Days</p>
                  <p className="text-2xl font-bold text-slate-700">{historicalData.filter(d => d.snowfall > 0).length}</p>
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
                  <Cloud className="w-5 h-5" />Snowfall
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
            <div className="text-center py-8 text-slate-500">Loading historical data...</div>
          )}
        </div>

        {/* EXTENDED FORECAST SECTION */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-800">Extended Forecast - Trip Planning</h2>
          </div>
          <p className="text-gray-600 mb-4">Plan your backcountry adventures with extended weather forecasts for {selectedLocation.name}</p>
          
          {/* Forecast Range Selector */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setForecastRange('7day')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                forecastRange === '7day'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              7-Day Detailed
            </button>
            <button
              onClick={() => setForecastRange('16day')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                forecastRange === '16day'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              16-Day Overview
            </button>
          </div>

          {forecastLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading forecast data...</p>
              </div>
            </div>
          ) : extendedForecast ? (
            <>
              {/* 7-Day Detailed Forecast */}
              {forecastRange === '7day' && (
                <div className="space-y-4">
                  {sevenDayForecast.map((day, index) => (
                    <div key={day.date} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      {/* Daily Summary Card */}
                      <div
                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-6 flex-wrap">
                            {/* Date */}
                            <div className="text-center min-w-24">
                              <div className="text-xl md:text-2xl font-bold text-gray-800">{day.dayName}</div>
                              <div className="text-sm text-gray-500">{new Date(day.date).toLocaleDateString('en-GB')}</div>
                            </div>

                            {/* Weather Conditions */}
                            <div className="flex items-center gap-3">
                              <Cloud className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />
                              <div>
                                <div className="font-medium text-gray-800">{day.conditions}</div>
                                <div className="text-sm text-gray-500">
                                  {day.tempHigh}°C / {day.tempLow}°C
                                </div>
                              </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="flex gap-4 md:gap-6 flex-wrap">
                              {/* Snowfall */}
                              <div className="flex items-center gap-2">
                                <Snowflake className="w-5 h-5 text-blue-600" />
                                <div>
                                  <div className="text-lg font-bold text-gray-800">{day.snowfall}cm</div>
                                  <div className="text-xs text-gray-500">Snow</div>
                                </div>
                              </div>

                              {/* Wind */}
                              <div className="flex items-center gap-2">
                                <Wind className="w-5 h-5 text-gray-600" />
                                <div>
                                  <div className="text-lg font-bold text-gray-800">{day.windSpeed} km/h</div>
                                  <div className="text-xs text-gray-500">Wind</div>
                                </div>
                              </div>

                              {/* Freezing Level */}
                              <div className="flex items-center gap-2">
                                <Mountain className="w-5 h-5 text-purple-600" />
                                <div>
                                  <div className="text-lg font-bold text-gray-800">{day.freezingLevel}m</div>
                                  <div className="text-xs text-gray-500">0°C Level</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Risk Badge & Expand Icon */}
                          <div className="flex items-center gap-4">
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getForecastRiskColor(day.avalancheRisk)}`}>
                              {day.avalancheRisk.charAt(0).toUpperCase() + day.avalancheRisk.slice(1)} Risk
                            </span>
                            {expandedDay === index ? (
                              <ChevronUp className="w-6 h-6 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Hourly Breakdown (Expandable) */}
                      {expandedDay === index && day.hourly && (
                        <div className="bg-gray-50 border-t border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Thermometer className="w-5 h-5 text-red-500" />
                            Hourly Breakdown
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {day.hourly.map((hour, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="text-center">
                                  <div className="text-sm font-semibold text-gray-600 mb-2">{hour.time}</div>
                                  <div className="text-2xl font-bold text-gray-800 mb-1">{hour.temp}°C</div>
                                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                    <Snowflake className="w-4 h-4 text-blue-500" />
                                    <span>{hour.snow}cm</span>
                                  </div>
                                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-1">
                                    <Wind className="w-4 h-4 text-gray-500" />
                                    <span>{hour.wind} km/h</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 16-Day Overview */}
              {forecastRange === '16day' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    16-Day Outlook
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sixteenDayOverview.map((day) => (
                      <div key={day.date} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-indigo-200">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-600 mb-1">{day.dayShort}</div>
                          <div className="text-xs text-gray-500 mb-3">{new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</div>
                          <div className="text-2xl font-bold text-gray-800 mb-2">{day.tempHigh}°C</div>
                          <div className="flex items-center justify-center gap-1 text-sm mb-2">
                            <Snowflake className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-gray-700">{day.snowfall}cm</span>
                          </div>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getForecastRiskColor(day.avalancheRisk)}`}>
                            {day.avalancheRisk.charAt(0).toUpperCase() + day.avalancheRisk.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-6 text-center italic">
                    Long-range forecasts become less accurate beyond 7 days. Use for general trip planning only.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-700">Unable to load extended forecast. Please try refreshing.</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Thermometer className="w-6 h-6 text-blue-600" />Current Weather - {selectedLocation.name}
            </h2>
            
            {weatherData && weatherData.current ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Temperature</span>
                  <span className="text-2xl font-bold text-blue-600">{Math.round(weatherData.current.temperature_2m)}°C</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium flex items-center gap-2">
                    <Wind className="w-5 h-5" />Wind Speed
                  </span>
                  <span className="text-xl font-bold text-slate-700">{Math.round(weatherData.current.windspeed_10m)} km/h</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Snowfall (current)</span>
                  <span className="text-xl font-bold text-slate-700">{weatherData.current.snowfall || 0} cm</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">Loading weather data...</div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Useful Resources</h2>
            <div className="space-y-3">
              <a href="https://www.meribel.net/en/" target="_blank" rel="noopener noreferrer" className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-700 group-hover:text-blue-600">Official Méribel Site</div>
                    <div className="text-sm text-slate-500">Lift status, piste maps, events</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </div>
              </a>
              <a href="https://meteofrance.com/meteo-montagne/meribel/733890" target="_blank" rel="noopener noreferrer" className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-700 group-hover:text-blue-600">Météo-France Méribel</div>
                    <div className="text-sm text-slate-500">Official weather forecasts</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Information</h3>
          <p className="text-sm text-yellow-700 mb-2">This dashboard is for informational purposes only. For backcountry skiing and off-piste activities, always:</p>
          <ul className="text-sm text-yellow-700 space-y-1 ml-4">
            <li>• Check official Météo-France mountain forecasts before heading out</li>
            <li>• Consult local mountain guides and ski patrol services</li>
            <li>• Carry proper avalanche safety equipment (beacon, shovel, probe)</li>
            <li>• Never ski alone in avalanche terrain</li>
            <li>• Take an avalanche safety course if you plan to ski off-piste</li>
          </ul>
          <p className="text-sm text-yellow-700 mt-2">Weather data: Open-Meteo API | Webcams: Méribel Tourism Office</p>
        </div>
      </div>
    </div>
  );
}
