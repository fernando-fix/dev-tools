import Default from "../layouts/Default";
import { useState, useRef, useEffect } from "react";
import { FiCopy, FiRefreshCw, FiCheck } from "react-icons/fi";

const generateDigit = (numbers: number[], weights: number[]) => {
  const sum = numbers.reduce((acc, num, i) => acc + (num * weights[i]), 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
};

const formatCpf = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(\-\d{2})\d+?$/, '$1');
};

const formatCnpj = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(\-\d{2})\d+?$/, '$1');
};

export default function CpfCnpjGenerator() {
    const [cpf, setCpf] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [showFormatted, setShowFormatted] = useState(true);
    const [copied, setCopied] = useState<{cpf?: boolean, cnpj?: boolean}>({});
    const cpfInputRef = useRef<HTMLInputElement>(null);
    const cnpjInputRef = useRef<HTMLInputElement>(null);
    
    const toggleFormat = () => {
        setShowFormatted(!showFormatted);
    };
    
    const generateCpf = (e?: React.FormEvent) => {
        e?.preventDefault();
        const numbers = Array(9).fill(0).map(() => Math.floor(Math.random() * 10));
        
        // First verification digit
        numbers.push(generateDigit(numbers, [10, 9, 8, 7, 6, 5, 4, 3, 2]));
        // Second verification digit
        numbers.push(generateDigit(numbers, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]));
        
        const newCpf = numbers.join('');
        setCpf(formatCpf(newCpf));
        setCopied({...copied, cpf: false});
    };
    
    const generateCnpj = (e?: React.FormEvent) => {
        e?.preventDefault();
        const numbers = Array(12).fill(0).map(() => Math.floor(Math.random() * 10));
        
        // First verification digit
        numbers.push(generateDigit(numbers, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
        // Second verification digit
        numbers.push(generateDigit(numbers, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
        
        const newCnpj = numbers.join('');
        setCnpj(formatCnpj(newCnpj));
        setCopied({...copied, cnpj: false});
    };
    
    const copyToClipboard = (text: string, type: 'cpf' | 'cnpj') => {
        navigator.clipboard.writeText(text);
        setCopied({...copied, [type]: true});
        setTimeout(() => setCopied({...copied, [type]: false}), 2000);
    };
    
    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
        setCpf(showFormatted ? formatCpf(value) : value);
        setCopied({...copied, cpf: false});
    };
    
    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 14);
        setCnpj(showFormatted ? formatCnpj(value) : value);
        setCopied({...copied, cnpj: false});
    };
    
    const formatCpfForDisplay = (value: string) => {
        return showFormatted ? value : value.replace(/[^\d]/g, '');
    };
    
    const formatCnpjForDisplay = (value: string) => {
        return showFormatted ? value : value.replace(/[^\d]/g, '');
    };
    
    // Update display format when toggled
    useEffect(() => {
        if (cpf) {
            const cleanCpf = cpf.replace(/\D/g, '');
            setCpf(showFormatted ? formatCpf(cleanCpf) : cleanCpf);
        }
        if (cnpj) {
            const cleanCnpj = cnpj.replace(/\D/g, '');
            setCnpj(showFormatted ? formatCnpj(cleanCnpj) : cleanCnpj);
        }
    }, [showFormatted]);

    // Generate initial values
    useEffect(() => {
        generateCpf();
        generateCnpj();
    }, []);
    
    return (
        <Default pageTitle="Gerador de CPF e CNPJ">
            <div className="max-w-lg mx-auto p-4 sm:p-6">
                <div className="bg-gray-800 rounded-xl p-6 sm:p-8 mb-8 border border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Gerador de CPF e CNPJ</h2>
                        <button
                            onClick={toggleFormat}
                            className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors cursor-pointer flex items-center gap-1"
                            title={showFormatted ? "Mostrar apenas números" : "Mostrar formatado"}
                        >
                            <span className={`font-medium ${showFormatted ? 'text-gray-400' : 'text-green-500'}`}>
                                {showFormatted ? 'Formatado' : 'Original'}
                            </span>
                        </button>
                    </div>
                    
                    <form onSubmit={generateCpf} className="mb-8">
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="cpf" className="block text-sm font-medium text-gray-300">CPF</label>
                                <button 
                                    type="button" 
                                    onClick={generateCpf}
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                                    title="Gerar novo CPF"
                                >
                                    <FiRefreshCw size={14} /> Gerar
                                </button>
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    id="cpf" 
                                    ref={cpfInputRef}
                                    className="w-full px-3 py-2 pr-10 rounded bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
                                    value={formatCpfForDisplay(cpf)}
                                    onChange={handleCpfChange}
                                    placeholder={showFormatted ? "000.000.000-00" : "00000000000"}
                                    maxLength={14}
                                />
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(cpf.replace(/\D/g, ''), 'cpf')}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                    title="Copiar CPF"
                                >
                                    {copied.cpf ? <FiCheck className="text-green-400" /> : <FiCopy />}
                                </button>
                            </div>
                        </div>
                    </form>
                    
                    <form onSubmit={generateCnpj}>
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="cnpj" className="block text-sm font-medium text-gray-300">CNPJ</label>
                                <button 
                                    type="button" 
                                    onClick={generateCnpj}
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                                    title="Gerar novo CNPJ"
                                >
                                    <FiRefreshCw size={14} /> Gerar
                                </button>
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    id="cnpj" 
                                    ref={cnpjInputRef}
                                    className="w-full px-3 py-2 pr-10 rounded bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
                                    value={formatCnpjForDisplay(cnpj)}
                                    onChange={handleCnpjChange}
                                    placeholder={showFormatted ? "00.000.000/0000-00" : "00000000000000"}
                                    maxLength={18}
                                />
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(cnpj.replace(/\D/g, ''), 'cnpj')}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                    title="Copiar CNPJ"
                                >
                                    {copied.cnpj ? <FiCheck className="text-green-400" /> : <FiCopy />}
                                </button>
                            </div>
                        </div>
                        
                        
                    </form>
                    
                    <div className="mt-6 text-xs text-gray-400 text-center">
                        <p>Os documentos gerados são válidos apenas para fins de teste.</p>
                    </div>
                </div>
            </div>
        </Default>
    );
}