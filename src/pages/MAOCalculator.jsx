import React, { useState, useEffect } from 'react';
import WorkflowInput from '../components/WorkflowInput';
import { formatCurrency } from '../utils/formatters';
import { FiRefreshCw } from 'react-icons/fi';
import SafeIcon from '../components/SafeIcon';

function MAOCalculator({
  savedRehabAmount = 0,
  initialValues = {},
  onProceed,
  onBack,
}) {
  // State for Rehab Cost Estimate
  const [rehabCost, setRehabCost] = useState(initialValues.rehabCost || '');

  // Other state placeholders (ARV, selectedPercent, customPercent, etc.)
  const [arv, setArv] = useState(initialValues.arv || '');
  const [selectedPercent, setSelectedPercent] = useState(initialValues.selectedPercent || '75');
  const [customPercent, setCustomPercent] = useState(initialValues.customPercent || '');

  // Compute the placeholder for Rehab Cost by stripping
  const rehabDisplay = formatCurrency(savedRehabAmount).replace(/^\$/, '');

  // Preload rehab estimate into rehabCost input on mount
  useEffect(() => {
    if (savedRehabAmount > 0 && !rehabCost) {
      setRehabCost(savedRehabAmount.toString());
    }
  }, [savedRehabAmount]); "$"
  const rehabDisplay = formatCurrency(savedRehabAmount).replace(/^\$/, '');

  // Handler to use the saved rehab estimate
  const useRehabEstimate = () => {
    setRehabCost(savedRehabAmount.toString());
  };

  // Compute MAO whenever ARV or percentage changes
  const [maoValue, setMaoValue] = useState('');
  useEffect(() => {
    const percent = selectedPercent === 'custom' ? parseFloat(customPercent) : parseFloat(selectedPercent);
    const arvNum = parseFloat(arv) || 0;
    if (!isNaN(percent) && percent > 0) {
      setMaoValue(((percent / 100) * arvNum).toFixed(2));
    }
  }, [arv, selectedPercent, customPercent]);

  // Proceed handler
  const handleProceed = () => {
    onProceed({
      rehabCost,
      arv,
      selectedPercent,
      customPercent,
      maoValue,
    });
  };

  return (
    <div className="mao-page p-4">
      {/* Rehab Cost Estimate Input */}
      <WorkflowInput
        label="Rehab Cost Estimate"
        type="number"
        value={rehabCost}
        onChange={setRehabCost}
        placeholder={rehabDisplay}
        required
      />

      {/* Use Rehab Estimate Button */}
      {savedRehabAmount > 0 && (
        <div className="mt-2">
          <button
            onClick={useRehabEstimate}
            className="text-sm bg-green-50 text-green-700 px-3 py-2 rounded-md border border-green-200 hover:bg-green-100 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
            <span>Use Rehab Estimate: {formatCurrency(savedRehabAmount)}</span>
          </button>
        </div>
      )}

      {/* ARV Input */}
      <WorkflowInput
        label="After Repair Value (ARV)"
        type="number"
        value={arv}
        onChange={setArv}
        placeholder="Enter ARV"
        required
      />

      {/* Percentage Strategy Selector */}
      <div className="mt-4">
        <label className="block font-medium mb-2">Select ARV Strategy:</label>
        <div className="space-y-2">
          {[70, 75, 80].map((pct) => (
            <label key={pct} className="flex items-center">
              <input
                type="radio"
                name="percentStrategy"
                value={pct}
                checked={selectedPercent === pct.toString()}
                onChange={() => setSelectedPercent(pct.toString())}
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
      </div>

      {/* Display Computed MAO */}
      {maoValue && (
        <div className="mt-4 font-semibold">
          Max Allowable Offer: ${maoValue}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="mt-6 flex justify-between">
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
