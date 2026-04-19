import React, { useRef } from 'react';
import { AppSettings, ShopItem, InventoryItem } from '../types';
import { Settings as SettingsIcon, Shield, RefreshCw, Upload, Save, UserCheck, CheckCircle2, DollarSign } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  shopItems: ShopItem[];
  setShopItems: (items: ShopItem[]) => void;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

export default function Settings({ 
  settings, 
  setSettings,
  shopItems,
  setShopItems,
  inventory,
  setInventory
}: SettingsProps) {
  const [localSettings, setLocalSettings] = React.useState<AppSettings>(settings);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = () => {
    setSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const aidInputRef = useRef<HTMLInputElement>(null);
  const fgsInputRef = useRef<HTMLInputElement>(null);

  const handleImportAid = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (imported.type === 'fgs_agent_identity' && imported.agentId && imported.name) {
            setLocalSettings(prev => ({
              ...prev,
              linkedAgent: {
                agentId: imported.agentId,
                displayId: imported.displayId,
                name: imported.name,
                defaultCommission: imported.defaultCommission || 0
              }
            }));
            alert('Agent Identity Linked Successfully. Please click "Save Settings".');
          } else {
            alert('Invalid .aid file format.');
          }
        } catch (err) {
          console.error("Failed to parse aid", err);
          alert("Invalid file format.");
        }
      };
      reader.readAsText(file);
    }
    if (event.target) event.target.value = '';
  };

  const handleImportFgs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (imported.type === 'fgs_agent_data') {
             let message = 'Store data refreshed successfully!\n';
             if (imported.shopItems) {
                setShopItems(imported.shopItems);
                message += '- Shop Items updated\n';
             }
             if (imported.inventory) {
                const newInventory = [...inventory];
                imported.inventory.forEach((importedInv: any) => {
                   const existingIdx = newInventory.findIndex(i => i.id === importedInv.id);
                   if (existingIdx > -1) {
                      newInventory[existingIdx] = importedInv;
                   } else {
                      newInventory.push(importedInv);
                   }
                });
                setInventory(newInventory);
                message += '- Stock Limits updated\n';
             }
             alert(message);
          } else {
             alert('Invalid .fgs file format. Ensure it is store data.');
          }
        } catch (err) {
          console.error("Failed to parse fgs", err);
          alert("Invalid file format.");
        }
      };
      reader.readAsText(file);
    }
    if (event.target) event.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-app-text tracking-tight flex items-center gap-3">
          <SettingsIcon size={32} className="text-red-500" />
          Settings
        </h1>
        <p className="text-app-muted font-medium mt-1">Configure global application settings and preferences.</p>
      </div>

      <div className="bg-app-card rounded-2xl border border-app-border overflow-hidden">
        <div className="px-6 py-4 border-b border-app-border bg-app-bg/50 flex items-center gap-2">
          <DollarSign size={20} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-app-text">
            Currency & Conversion
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase text-app-muted tracking-widest mb-1.5">Global Currency Symbol</label>
              <input
                type="text"
                value={localSettings.currencySymbol}
                onChange={e => setLocalSettings({...localSettings, currencySymbol: e.target.value})}
                className="w-full px-4 py-3 bg-app-bg text-app-text border border-app-border rounded-xl focus:border-app-accent outline-none font-medium shadow-sm transition-colors"
                placeholder="e.g. RM, $"
              />
              <p className="text-xs text-app-muted mt-2">This symbol will be displayed across the app (Budgets, Sell Tracker, etc.)</p>
            </div>
            
            <div>
              <label className="block text-xs font-black uppercase text-app-muted tracking-widest mb-1.5">Base Currency Name</label>
              <input
                type="text"
                value={localSettings.baseCurrency}
                onChange={e => setLocalSettings({...localSettings, baseCurrency: e.target.value})}
                className="w-full px-4 py-3 bg-app-bg text-app-text border border-app-border rounded-xl focus:border-app-accent outline-none font-medium shadow-sm transition-colors"
                placeholder="e.g. USD, EUR"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-app-muted tracking-widest mb-1.5">Target Currency Name</label>
              <input
                type="text"
                value={localSettings.targetCurrency}
                onChange={e => setLocalSettings({...localSettings, targetCurrency: e.target.value})}
                className="w-full px-4 py-3 bg-app-bg text-app-text border border-app-border rounded-xl focus:border-app-accent outline-none font-medium shadow-sm transition-colors"
                placeholder="e.g. RM, GBP"
              />
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="block text-xs font-black uppercase text-app-muted tracking-widest">Conversion Multiplier</label>
                <div className="text-sm font-black text-app-text">
                  1 {localSettings.baseCurrency || 'USD'} = {localSettings.currencyMultiplier || 1} {localSettings.targetCurrency || 'RM'}
                </div>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={localSettings.currencyMultiplier}
                onChange={e => setLocalSettings({...localSettings, currencyMultiplier: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-3 bg-app-bg text-app-text border border-app-border rounded-xl focus:border-app-accent outline-none font-medium shadow-sm transition-colors"
                placeholder="e.g. 3.95"
              />
              <p className="text-xs text-app-muted mt-2">This multiplier can be used in your calculations. Note: Currently this doesn't auto-convert your historical data but updates future UI interactions where applied.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-app-card rounded-2xl border border-app-border overflow-hidden">
        <div className="px-6 py-4 border-b border-app-border bg-app-bg/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-app-text flex items-center gap-2">
            <Shield size={20} className="text-emerald-500" />
            Connected Identity Card
          </h2>
          {localSettings.linkedAgent && (
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20">
              <CheckCircle2 size={14} /> Active Link
            </span>
          )}
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-app-bg border border-app-border rounded-xl p-4">
              <label className="block text-[10px] font-black uppercase text-app-muted mb-1 tracking-widest flex items-center gap-1"><UserCheck size={12}/> Agent Name</label>
              <div className="text-lg font-bold text-app-text px-1 py-1">
                {localSettings.linkedAgent?.name || 'Not Linked'}
              </div>
            </div>
            
            <div className="bg-app-bg border border-app-border rounded-xl p-4">
              <label className="block text-[10px] font-black uppercase text-app-muted mb-1 tracking-widest">Agent ID</label>
              <div className="text-base font-bold text-app-text px-1 py-1 font-mono text-emerald-500">
                {localSettings.linkedAgent?.displayId || localSettings.linkedAgent?.agentId || 'Not Linked'}
              </div>
            </div>
            
            <div className="bg-app-bg border border-app-border rounded-xl p-4">
              <label className="block text-[10px] font-black uppercase text-app-muted mb-1 tracking-widest">Base Commission</label>
              <div className="text-lg font-bold text-app-text px-1 py-1 text-app-accent">
                {localSettings.linkedAgent ? `${localSettings.linkedAgent.defaultCommission}%` : 'Not Linked'}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-app-border border-dashed">
            <input 
              type="file" 
              accept=".aid" 
              ref={aidInputRef} 
              onChange={handleImportAid} 
              className="hidden" 
            />
            <button
              onClick={() => aidInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-app-bg border text-app-text hover:text-white border-app-border hover:bg-emerald-500 hover:border-emerald-500 rounded-xl transition-all font-bold group shadow-sm"
            >
              <Upload size={18} className="text-app-muted group-hover:text-white" />
              Import Identity Link (.aid)
            </button>

            <input 
              type="file" 
              accept=".fgs,.fgs_agent_data" 
              ref={fgsInputRef} 
              onChange={handleImportFgs} 
              className="hidden" 
            />
            <button
              onClick={() => fgsInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-app-bg border text-app-text hover:text-white border-app-border hover:bg-blue-500 hover:border-blue-500 rounded-xl transition-all font-bold group shadow-sm"
            >
              <RefreshCw size={18} className="text-app-muted group-hover:text-white" />
              Refresh Store Data (.fgs)
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6">
        <span className="text-[10px] font-black text-app-muted uppercase tracking-[0.2em]">Fragrance Planner For Agent v1.2.1</span>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-bold shadow-lg shadow-emerald-500/20"
        >
          {isSaved ? <span className="flex items-center gap-2"><CheckCircle2 size={18} /> Saved successfully</span> : <span className="flex items-center gap-2"><Save size={18} /> Save Settings</span>}
        </button>
      </div>
    </div>
  );
}
