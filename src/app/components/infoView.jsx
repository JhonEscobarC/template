import { Loader2 } from "lucide-react";

export default function LoadingIndicator({ message = "Cargando..." }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "var(--secondBackground)" }}>
            <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl shadow-2xl border border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-10 rounded-3xl"></div>
                <Loader2 className="w-14 h-14 animate-spin text-blue-600 relative z-10" />
                <span className="mt-5 text-gray-900 font-extrabold text-2xl relative z-10">{message}</span>
                <div className="w-full mt-4 h-1 bg-gray-300 rounded-full overflow-hidden relative z-10">
                    <div className="h-full bg-blue-500 animate-pulse w-3/4"></div>
                </div>
            </div>
        </div>
    );
}
