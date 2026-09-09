"use client";

import { useState } from "react";
import { Settings, Key, Check, X, ExternalLink, Zap, ChevronDown, ChevronUp, Shield, AlertTriangle } from "lucide-react";
import { useSettings, AIProvider } from "@/lib/SettingsContext";

export default function ConfiguracionPage() {
  const { settings, updateProvider, setActiveProvider } = useSettings();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const handleToggle = (provider: AIProvider) => {
    updateProvider(provider.id, { enabled: !provider.enabled });
    if (!provider.enabled) {
      setActiveProvider(provider.id);
    }
  };

  const handleApiKeyChange = (id: string, key: string) => {
    updateProvider(id, { apiKey: key });
  };

  const handleModelChange = (id: string, model: string) => {
    updateProvider(id, { selectedModel: model });
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-purple-500/30">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">

        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <Settings className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
            Configuración de IA
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Configura tus API keys y selecciona qué proveedor de IA usar. Agrega una key para activar un proveedor automáticamente.
          </p>
        </header>

        {/* Active Provider Status */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 rounded-3xl border border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Proveedor Activo</h3>
              <p className="text-slate-400 text-sm">
                {settings.providers.find(p => p.id === settings.activeProviderId)?.icon}{" "}
                {settings.providers.find(p => p.id === settings.activeProviderId)?.name || "Ninguno"}{" "}
                — {settings.providers.find(p => p.id === settings.activeProviderId)?.selectedModel}
              </p>
            </div>
          </div>
        </div>

        {/* Provider List */}
        <div className="space-y-4">
          {settings.providers.map((provider) => {
            const isExpanded = expandedId === provider.id;
            const isActive = provider.id === settings.activeProviderId;

            return (
              <div
                key={provider.id}
                className={`bg-slate-900/50 rounded-3xl border transition-all duration-300 ${
                  isActive
                    ? "border-purple-500/50 shadow-lg shadow-purple-500/10"
                    : provider.enabled
                    ? "border-slate-700/50"
                    : "border-slate-800/50 opacity-70"
                }`}
              >
                {/* Provider Header */}
                <div className="p-5 md:p-6 flex items-center gap-4">
                  <div className="text-3xl">{provider.icon}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className={`text-lg font-bold ${provider.color}`}>{provider.name}</h3>
                      {isActive && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-semibold border border-purple-500/30">
                          ACTIVO
                        </span>
                      )}
                      {provider.apiKey && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <Key className="w-3 h-3" /> Configurado
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm mt-0.5 truncate">
                      {provider.selectedModel}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Toggle Button */}
                    <button
                      onClick={() => handleToggle(provider)}
                      disabled={!provider.apiKey}
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                        provider.enabled
                          ? "bg-purple-500"
                          : "bg-slate-700"
                      } ${!provider.apiKey ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div
                        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 ${
                          provider.enabled ? "left-7" : "left-0.5"
                        }`}
                      />
                    </button>

                    {/* Expand Button */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : provider.id)}
                      className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Settings */}
                {isExpanded && (
                  <div className="px-5 md:px-6 pb-6 space-y-4 border-t border-slate-800/50 pt-4">
                    {/* API Key Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Key className="w-4 h-4 text-slate-400" /> API Key
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showKeys[provider.id] ? "text" : "password"}
                            value={provider.apiKey}
                            onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                            placeholder={`Pega tu API key de ${provider.name}...`}
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 pr-12 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-sm"
                          />
                          <button
                            onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                          >
                            {showKeys[provider.id] ? <X className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </button>
                        </div>
                        <a
                          href={provider.apiKeyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Obtener Key
                        </a>
                      </div>
                      {provider.apiKey && (
                        <div className="flex items-center gap-2 text-xs text-emerald-400 mt-1">
                          <Check className="w-3 h-3" /> API Key configurada
                        </div>
                      )}
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Modelo
                      </label>
                      <select
                        value={provider.selectedModel}
                        onChange={(e) => handleModelChange(provider.id, e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none"
                      >
                        {provider.models.map((model) => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>

                    {/* Set Active Button */}
                    {provider.apiKey && !isActive && (
                      <button
                        onClick={() => setActiveProvider(provider.id)}
                        className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 py-3 rounded-xl font-semibold transition-colors"
                      >
                        Usar este proveedor como activo
                      </button>
                    )}

                    {/* Warning if no key */}
                    {!provider.apiKey && (
                      <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        Necesitas una API key para usar este proveedor. Haz clic en &quot;Obtener Key&quot; para ir al panel del proveedor.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className="bg-slate-900/30 p-6 rounded-3xl border border-slate-800/50 space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" /> Información de Seguridad
          </h3>
          <ul className="text-sm text-slate-400 space-y-2">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              Tus API keys se guardan localmente en tu navegador (localStorage).
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              NUNCA se envían a nuestros servidores. Solo se usan directamente desde tu navegador al proveedor de IA.
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              Puedes eliminarlas en cualquier momento borrando el contenido del campo.
            </li>
          </ul>
        </div>

      </div>
    </main>
  );
}
