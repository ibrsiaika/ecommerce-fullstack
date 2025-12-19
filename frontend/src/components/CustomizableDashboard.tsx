import React, { useState } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { FiEye, FiEyeOff, FiSettings } from 'react-icons/fi';

interface DraggableWidget {
  id: string;
  name: string;
  enabled: boolean;
  position: number;
  size?: 'small' | 'medium' | 'large';
}

interface CustomizableDashboardProps {
  children?: React.ReactNode;
}

const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({ children }) => {
  const { dashboardWidgets, updateWidgets, toggleWidget, rearrangeWidgets } = useCustomization();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<DraggableWidget[]>(dashboardWidgets);

  // Update local state when context changes
  React.useEffect(() => {
    setWidgets(dashboardWidgets);
  }, [dashboardWidgets]);

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedWidget || draggedWidget === targetId) {
      setDraggedWidget(null);
      return;
    }

    const draggedIndex = widgets.findIndex(w => w.id === draggedWidget);
    const targetIndex = widgets.findIndex(w => w.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedWidget(null);
      return;
    }

    const newWidgets = [...widgets];
    [newWidgets[draggedIndex], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[draggedIndex]];

    // Update positions
    const reorderedWidgets = newWidgets.map((w, idx) => ({ ...w, position: idx + 1 }));
    setWidgets(reorderedWidgets);
    setDraggedWidget(null);

    if (isCustomizing) {
      rearrangeWidgets(reorderedWidgets);
    }
  };

  const handleToggleWidget = (widgetId: string) => {
    const updatedWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    setWidgets(updatedWidgets);
    toggleWidget(widgetId);
  };

  const handleSaveCustomization = async () => {
    await updateWidgets(widgets);
    setIsCustomizing(false);
  };

  const enabledWidgets = widgets.filter(w => w.enabled).sort((a, b) => a.position - b.position);

  return (
    <div className="w-full">
      {/* Customization Toolbar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <FiSettings size={20} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {isCustomizing ? 'Customization Mode' : 'Dashboard View'}
          </span>
        </div>
        
        <div className="flex gap-3">
          {isCustomizing ? (
            <>
              <button
                onClick={handleSaveCustomization}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsCustomizing(false);
                  setWidgets(dashboardWidgets);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsCustomizing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <FiSettings size={16} />
              Customize
            </button>
          )}
        </div>
      </div>

      {/* Customization Mode */}
      {isCustomizing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Available Widgets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {widgets.map(widget => (
              <div
                key={widget.id}
                draggable
                onDragStart={(e) => handleDragStart(e, widget.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, widget.id)}
                className={`p-3 rounded-lg border-2 cursor-move transition-all ${
                  draggedWidget === widget.id
                    ? 'border-blue-500 bg-blue-100 opacity-50'
                    : 'border-gray-300 bg-white hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-800">{widget.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Size: {widget.size || 'medium'} | Position: {widget.position}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleWidget(widget.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                    title={widget.enabled ? 'Hide widget' : 'Show widget'}
                  >
                    {widget.enabled ? (
                      <FiEye size={18} className="text-green-600" />
                    ) : (
                      <FiEyeOff size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3">
            💡 Drag widgets to rearrange. Click the eye icon to show/hide widgets.
          </p>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enabledWidgets.map(widget => (
          <div
            key={widget.id}
            className={`rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow ${
              widget.size === 'large' ? 'lg:col-span-2' : widget.size === 'small' ? 'lg:col-span-1' : ''
            }`}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.name}</h3>
              {/* Widget content will be rendered by parent component */}
              {children && React.Children.toArray(children).find((child: any) => child?.props?.widgetId === widget.id)}
            </div>
          </div>
        ))}
      </div>

      {enabledWidgets.length === 0 && !isCustomizing && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">No widgets enabled. Click "Customize" to show widgets.</p>
        </div>
      )}
    </div>
  );
};

export default CustomizableDashboard;
