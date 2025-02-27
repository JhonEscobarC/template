import { XCircle } from 'lucide-react';

export default function ErrorIndicator({ message = "No se encontraron datos." }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "var(--secondBackground)" }}>
            <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl shadow-2xl border border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-500 opacity-10 rounded-3xl"></div>
                <XCircle className="w-14 h-14 text-red-600 relative z-10" />
                <span className="mt-5 text-gray-900 font-extrabold text-2xl relative z-10">{message}</span>
            </div>
        </div>
    );
}
