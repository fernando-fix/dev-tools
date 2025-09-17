import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import Default from "../layouts/Default";

const formatPhone = (value: string) => {
    // Remove tudo que não for dígito
    const numbers = value.replace(/\D/g, '');
    
    // Se não tiver número, retorna vazio
    if (!numbers) return '';
    
    // Pega o DDD (2 primeiros dígitos) e o resto do número
    const ddd = numbers.substring(0, 2);
    const numberPart = numbers.substring(2);
    
    // Formata o número baseado no comprimento
    if (numberPart.length <= 5) {
        return `(${ddd}) ${numberPart}`;
    } else {
        return `(${ddd}) ${numberPart.substring(0, 5)}-${numberPart.substring(5, 9)}`;
    }
};

export default function WppLinkGenerator() {
    const [countryCode, setCountryCode] = useState('55');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [showGeneratedLink, setShowGeneratedLink] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Fechar o emoji picker ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    const onEmojiClick = (emojiData: EmojiClickData) => {
        const cursorPosition = textAreaRef.current?.selectionStart || 0;
        const textBeforeCursor = message.substring(0, cursorPosition);
        const textAfterCursor = message.substring(cursorPosition);
        
        setMessage(textBeforeCursor + emojiData.emoji + textAfterCursor);
        setShowGeneratedLink(false);
        
        // Mover o cursor para depois do emoji inserido
        setTimeout(() => {
            const newPosition = cursorPosition + emojiData.emoji.length;
            textAreaRef.current?.setSelectionRange(newPosition, newPosition);
            textAreaRef.current?.focus();
        }, 0);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, '');
        setPhone(digits);
        setShowGeneratedLink(false);
    };

    const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCountryCode(e.target.value.replace(/\D/g, ''));
        setShowGeneratedLink(false);
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        setShowGeneratedLink(false);
    };

    const generateLink = (e: React.FormEvent) => {
        e.preventDefault();
        // Remove todos os caracteres não numéricos
        const cleanedPhone = phone.replace(/\D/g, '');
        // Adiciona o código do país
        const fullNumber = countryCode + cleanedPhone;
        
        // Primeiro, substitui as quebras de linha por \n
        // Cria um array com as linhas da mensagem
        const lines = message.split('\n');
        
        // Codifica cada linha individualmente e depois junta com %0A
        const encodedLines = lines.map(line => encodeURIComponent(line));
        const encodedMessage = encodedLines.join('%0A');
        
        // Gera o link do WhatsApp que inicia a conversa diretamente
        const whatsappLink = `https://web.whatsapp.com/send/?phone=${fullNumber}&text=${encodedMessage}&type=phone_number&app_absent=0`;
        
        setGeneratedLink(whatsappLink);
        setShowGeneratedLink(true);
    };

    const copyToClipboard = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            alert('Link copiado para a área de transferência!');
        }
    };

    return (
        <Default pageTitle="Gerador de Link para WhatsApp">
            <div className="max-w-lg mx-auto p-6">
                <div className="bg-gray-800 rounded-xl p-8 mb-8 border border-gray-700">
                    <h2 className="text-xl font-bold mb-6 text-center text-white">Gerador de Link para WhatsApp</h2>
                    
                    <form onSubmit={generateLink} className="space-y-6">
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">
                                    País
                                </label>
                                <div className="flex items-center">
                                    <span className="bg-gray-700 text-gray-300 border border-r-0 border-gray-600 rounded-l px-3 py-2">+</span>
                                    <input
                                        type="text"
                                        value={countryCode}
                                        onChange={handleCountryCodeChange}
                                        placeholder="55"
                                        className="w-full px-3 py-2 rounded-r bg-gray-700 border border-l-0 border-gray-600 text-white"
                                        maxLength={3}
                                    />
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-sm font-medium mb-2 text-gray-300">
                                    Número (com DDD)
                                </label>
                            <input
                                type="tel"
                                value={formatPhone(phone)}
                                onChange={handlePhoneChange}
                                placeholder="(00) 00000-0000"
                                className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                                maxLength={15}
                                required
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Insira o DDD + número do telefone
                            </p>
                        </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 text-gray-300">
                                Mensagem (opcional)
                            </label>
                            <div className="relative">
                                <textarea
                                    ref={textAreaRef}
                                    value={message}
                                    onChange={handleMessageChange}
                                    placeholder="Digite sua mensagem aqui..."
                                    rows={4}
                                    className="w-full px-3 py-2 pr-10 rounded bg-gray-700 border border-gray-600 text-white"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowEmojiPicker(!showEmojiPicker);
                                    }}
                                    className="absolute right-2 bottom-2 p-1 text-gray-400 hover:text-white cursor-pointer"
                                    title="Inserir emoji"
                                >
                                    😊
                                </button>
                                {showEmojiPicker && (
                                    <div 
                                        ref={emojiPickerRef}
                                        className="absolute right-0 bottom-12 z-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="w-[350px] h-[400px]">
                                            <EmojiPicker
                                                onEmojiClick={onEmojiClick}
                                                autoFocusSearch={false}
                                                previewConfig={{
                                                    showPreview: false
                                                }}
                                                searchDisabled={false}
                                                skinTonesDisabled
                                                lazyLoadEmojis
                                                width="100%"
                                                height="100%"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!phone}
                            className={`cursor-pointer w-full py-2 px-4 rounded-md text-white font-medium ${
                                !phone ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            Gerar Link
                        </button>
                    </form>

                    {showGeneratedLink && generatedLink && (
                        <div className="mt-8 p-4 bg-gray-700 rounded-lg border border-gray-600">
                            <h3 className="text-sm font-medium text-gray-300 mb-3">Seu link gerado:</h3>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={generatedLink}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 text-white text-sm rounded-l focus:outline-none"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 text-sm font-medium border border-l-0 border-gray-600 rounded-r"
                                >
                                    Copiar
                                </button>
                            </div>
                            <div className="mt-4">
                                <a
                                    href={generatedLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Abrir no WhatsApp
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Default>
    );
}