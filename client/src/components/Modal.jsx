import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const Modal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <AlertTriangle className="w-6 h-6 text-red-500" />;
            case 'success':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            default:
                return <Info className="w-6 h-6 text-blue-500" />;
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-500 hover:bg-red-600 text-white';
            case 'success':
                return 'bg-green-500 hover:bg-green-600 text-white';
            default:
                return 'bg-[#0F1720] hover:bg-[#2a3441] text-white';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4 mb-6">
                    <div className={`p-3 rounded-full bg-gray-50 flex-shrink-0`}>
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[#0F1720] mb-2">{title}</h3>
                        <p className="text-gray-500 leading-relaxed">{message}</p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    {onConfirm ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`px-5 py-2.5 rounded-xl font-bold transition-colors ${getButtonColor()}`}
                            >
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className={`px-5 py-2.5 rounded-xl font-bold transition-colors ${getButtonColor()}`}
                        >
                            Okay
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
