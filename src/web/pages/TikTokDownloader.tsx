import { useState } from "react";
import Default from "../layouts/Default";

export default function TikTokDownloader() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [videoData, setVideoData] = useState<any>(null);

    const handleDownload = async () => {
        setError("");
        setVideoData(null);
        if (!url.trim()) {
            setError("Cole a URL do vídeo do TikTok.");
            return;
        }
        setLoading(true);
        try {
            const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(url)}`;
            const res = await fetch(apiUrl);
            const data = await res.json();
            if (data.code !== 0) {
                setError("Não foi possível obter o vídeo. Verifique a URL ou tente novamente mais tarde.");
            } else {
                setVideoData(data.data);
            }
        } catch (e) {
            setError("Erro ao conectar à API. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Default pageTitle="Baixador de Vídeos do TikTok">
            <div className="max-w-lg mx-auto p-6">
                <div className="bg-gray-800 rounded-xl p-8 mb-8 border border-gray-700">
                    <h2 className="text-xl font-bold mb-6 text-center">Baixador de Vídeos do TikTok</h2>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Cole a URL do vídeo do TikTok</label>
                        <input
                            type="text"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://www.tiktok.com/@usuario/video/1234567890"
                            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />
                    </div>
                    <button
                        onClick={handleDownload}
                        disabled={loading}
                        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200 text-lg font-semibold disabled:opacity-60"
                    >
                        {loading ? "Buscando..." : "Carregar Vídeo"}
                    </button>
                    {error && <div className="text-red-400 text-sm mt-4 text-center">{error}</div>}
                </div>
                {videoData && (
                    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 flex flex-col items-center">
                        <h3 className="text-lg font-semibold mb-4 text-center">Pré-visualização</h3>
                        <video
                            src={videoData.play}
                            controls
                            className="rounded-lg border border-gray-600 max-w-full mb-4"
                            style={{ maxHeight: 400 }}
                        />
                        <a
                            href={videoData.play}
                            download
                            target="_blank"
                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-colors duration-200 text-lg font-semibold"
                        >
                            Baixar Vídeo
                        </a>
                        <div className="text-xs text-gray-400 mt-2">O vídeo pode conter marca d'água.</div>
                    </div>
                )}
            </div>
        </Default>
    );
} 