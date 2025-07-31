// src/pages/MAOCalculator.jsx

import React, { useState, useEffect } from 'react';
import WorkflowInput from '../common/WorkflowInput';
import SafeIcon from '../common/SafeIcon';
import { FiRefreshCw } from 'react-icons/fi';
import { formatCurrency } from '../utils/formatters';
import WorkflowNavigation from '../common/WorkflowNavigation';

function MAOCalculator({
  savedRehabAmount = 0,
  initialValues = {},
  onProceed,
  onBack,
}) {
  const [rehabCost, setRehabCost] = useState(initialValues.rehabCost || '');
  const [arv, setArv] = useState(initialValues.arv || '');
  const [selectedPercent, setSelectedPercent] = useState(initialValues.selectedPercent || '75');
  const [customPercent, setCustomPercent] = useState(initialValues.customPercent || '');
  const [maoValue, setMaoValue] = useState('');

  // Strip leading “$” for placeholder
  const rehabDisplay = formatCurrency(savedRehabAmount).replace(/^\$/, '');

  // Preload rehab estimate on mount
  useEffect(() => {
    if (savedRehabAmount > 0 && !rehabCost) {
      setRehabCost(savedRehabAmount.toString());
    }
  }, [savedRehabAmount]);

  // Live‐update MAO whenever inputs change
  useEffect(() => {
    const pct = selectedPercent === 'custom'
      ? parseFloat(customPercent)
      : parseFloat(selectedPercent);
    const arvNum = parseFloat(arv) || 0;
    if (!isNaN(pct) && pct > 0) {
      setMaoValue(((pct / 100) * arvNum).toFixed(2));
    }
  }, [arv, rehabCost, selectedPercent, customPercent]);

  const handleProceed = () => {
    onProceed({
      rehabCost,
      arv,
      selectedPercent,
      customPercent,
      finalMao: parseFloat(maoValue),
    });
  };

  return (
    <div className="mao-page p-4 space-y-6">
      {/* Rehab Cost */}
      <WorkflowInput
        label="Rehab Cost Estimate"
        type="number"
        value={rehabCost}
        onChange={setRehabCost}
        placeholder={rehabDisplay}
        required
      />

      {/* ARV Input */}
      <WorkflowInput
        label="After Repair Value (ARV)"
        type="number"
        value={arv}
        onChange={setArv}
        placeholder="Enter ARV"
        required
      />

      {/* ARV % Strategy */}
      <div className="space-y-2">
        {[70, 75, 80].map((pct) => (
          <label key={pct} className="flex items-center">
            <input
              type="radio"
              name="percentStrategy"
              value={String(pct)}
              checked={selectedPercent === String(pct)}
              onChange={() => setSelectedPercent(String(pct))}
              className="mr-2"
            />
            <span>{`${pct}% Rule`}</span>
          </label>
        ))}
        <label className="flex items-center">
          <input
            type="radio"
            name="percentStrategy"
            value="custom"
            checked={selectedPercent === 'custom'}
            onChange={() => setSelectedPercent('custom')}
            className="mr-2"
          />
          <span>Custom Rule</span>
          {selectedPercent === 'custom' && (
            <input
              type="number"
              value={customPercent}
              onChange={(e) => setCustomPercent(e.target.value)}
              placeholder="Enter %"
              className="ml-2 border rounded p-1 w-20"
            />
          )}
        </label>
      </div>

      {/* Computed MAO */}
      {maoValue && (
        <div className="font-semibold">
          Max Allowable Offer: {formatCurrency(parseFloat(maoValue))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Rehab Estimator
        </button>
        <button
          onClick={handleProceed}
          disabled={!maoValue}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
        >
          Proceed to Property Analyzer
        </button>
      </div>
    </div>
  );
}

export default MAOCalculator;
