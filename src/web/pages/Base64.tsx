import { useState } from "react";
import Default from "../layouts/Default";

export default function Base64() {
    const [inputText, setInputText] = useState<string>("");
    const [outputText, setOutputText] = useState<string>("");
    const [mode, setMode] = useState<"encode" | "decode">("encode");
    const [copied, setCopied] = useState<boolean>(false);

    const encodeText = (text: string): string => {
        try {
            return btoa(unescape(encodeURIComponent(text)));
        } catch (error) {
            return "Erro ao codificar o texto";
        }
    };

    const decodeText = (text: string): string => {
        try {
            return decodeURIComponent(escape(atob(text)));
        } catch (error) {
            return "Erro ao decodificar o texto. Verifique se o texto é um Base64 válido.";
        }
    };

    const handleProcess = () => {
        if (mode === "encode") {
            setOutputText(encodeText(inputText));
        } else {
            setOutputText(decodeText(inputText));
        }
    };

    const clearAll = () => {
        setInputText("");
        setOutputText("");
    };

    const swapTexts = () => {
        setInputText(outputText);
        setOutputText(inputText);
    };

    const copyToClipboard = async () => {
        if (outputText) {
            try {
                await navigator.clipboard.writeText(outputText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                alert("Erro ao copiar para a área de transferência");
            }
        }
    };

    return (
        <Default pageTitle="Encoder/Decoder Base64">
            <div className="max-w-[1200px] mx-auto p-6">

                <div className="flex flex-col lg:flex-row gap-8 items-center">
                    {/* Input */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 w-full lg:w-5/12 flex flex-col">
                        <h3 className="text-lg font-semibold mb-4">Texto de Entrada</h3>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Digite o texto aqui..."
                            className="w-full h-80 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setMode("encode");
                                    handleProcess();
                                }}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
                            >
                                Codificar
                            </button>
                            <button
                                onClick={() => {
                                    setMode("decode");
                                    handleProcess();
                                }}
                                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 cursor-pointer"
                            >
                                Decodificar
                            </button>
                            <button
                                onClick={clearAll}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 cursor-pointer"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>

                    {/* Seta de Troca */}
                    <div className="flex justify-center">
                        <button
                            onClick={swapTexts}
                            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors duration-200 cursor-pointer border border-gray-600"
                            title="Trocar textos"
                        >
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </button>
                    </div>

                    {/* Output */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 w-full lg:w-5/12 flex flex-col">
                        <h3 className="text-lg font-semibold mb-4">Resultado</h3>
                        <textarea
                            value={outputText}
                            readOnly
                            placeholder="Resultado aparecerá aqui..."
                            className="w-full h-80 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none resize-none"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={copyToClipboard}
                                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 cursor-pointer"
                            >
                                {copied ? "Copiado! ✓" : "Copiar"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Default>
    );
} 