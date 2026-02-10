import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Calendar, Snowflake, Wind, Thermometer, CloudRain, Mountain } from 'lucide-react';

const API_BASE_URL = 'https://meribel-api-production.up.railway.app';

const PlanningTab = ({ selectedRegion }) => {
  const [expandedDay, setExpandedDay] = useState(null);
  const [forecastRange, setForecastRange] = useState('7day');
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExtendedForecast();
  }, [selectedRegion, forecastRange]);

  const fetchExtendedForecast = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const days = forecastRange === '7day' ? 7 : 16;
      const response = await fetch(
        `${API_BASE_URL}/api/forecast/extended?lat=${selectedRegion.lat}&lon=${selectedRegion.lon}&days=${days}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      
      const data = await response.json();
      setForecastData(data);
    } catch (err) {
      console.error('Error fetching extended forecast:', err);
      setError('Unable to load forecast data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'considerable': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading forecast data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchExtendedForecast}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!forecastData) {
    return null;
  }

  const sevenDayForecast = forecastData.daily.slice(0, 7);
  const sixteenDayOverview = forecastData.daily;

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-8 h-8 text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-800">Trip Planning</h2>
        </div>
        <p className="text-gray-600">Plan your backcountry adventures with extended weather forecasts for {selectedRegion.name}</p>
        
        {/* Forecast Range Selector */}
        <div className="flex gap-4 mt-4">
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
      </div>

      {/* 7-Day Detailed Forecast */}
      {forecastRange === '7day' && (
        <div className="space-y-4">
          {sevenDayForecast.map((day, index) => (
            <div key={day.date} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Daily Summary Card */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedDay(expandedDay === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* Date */}
                    <div className="text-center min-w-24">
                      <div className="text-2xl font-bold text-gray-800">{day.dayName}</div>
                      <div className="text-sm text-gray-500">{new Date(day.date).toLocaleDateString('en-GB')}</div>
                    </div>

                    {/* Weather Icon & Conditions */}
                    <div className="flex items-center gap-3">
                      <CloudRain className="w-10 h-10 text-blue-500" />
                      <div>
                        <div className="font-medium text-gray-800">{day.conditions}</div>
                        <div className="text-sm text-gray-500">
                          {day.tempHigh}°C / {day.tempLow}°C
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="flex gap-6 ml-8">
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
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getRiskColor(day.avalancheRisk)}`}>
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
                  <div className="grid grid-cols-4 gap-4">
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
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            16-Day Outlook
          </h3>
          <div className="grid grid-cols-4 gap-4">
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
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getRiskColor(day.avalancheRisk)}`}>
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
    </div>
  );
};

export default PlanningTab;
