import { useState } from "react";
import Default from "../layouts/Default";

export default function LoremGenerator() {

    const [qttWords, setQttWords] = useState<number>(50);
    const [words, setWords] = useState('');
    const [copied, setCopied] = useState(false);

    const arrayWords: string[] = [
        'lorem',
        'ipsum',
        'dolor',
        'sit',
        'amet',
        'consectetur',
        'adipiscing',
        'elit',
        'nulla',
        'magna',
        'aliquam',
        'erat',
    ];

    const generateLorem = () => {
        if (isNaN(qttWords) || qttWords < 1) {
            setQttWords(1);
            alert('Por favor, insira um número maior que 0');
            return;
        }
        if (qttWords > 500) {
            alert('Por favor, insira um número menor ou igual a 500');
            setQttWords(500);
            return;
        }
        const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
        const text = Array.from({ length: qttWords }, () => arrayWords[random(0, arrayWords.length - 1)]).join(' ').replace(/^./, match => match.toUpperCase()).concat('. ');
        setWords(words + text);
    }

    const clearLorem = () => {
        setWords('');
    }
    const copyAlert = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <Default pageTitle="Gerador de Lorem Ipsum">
            <meta name="description" content="As melhores ferramentas de desenvolvimento em um unico lugar." />
            <div className="mx-auto max-w-[1090px]">
                <div className="flex flex-col space-y-4">
                    <label htmlFor="words" className="text-lg font-semibold">Número de palavras:</label>
                    <input type="number" id="words" min="1" value={qttWords} onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setQttWords(isNaN(value) ? 0 : value);
                    }} className="w-full px-3 py-2 rounded-md bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex justify-between gap-2">
                    <button onClick={generateLorem} className="mt-4 w-full px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                        Gerar {words.length > 0 ? 'mais' : ''} texto
                    </button>
                    <button onClick={clearLorem} className="mt-4 w-full px-3 py-2 rounded-md bg-yellow-500 text-black hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer">
                        Limpar texto
                    </button>
                </div>

                <textarea className="mt-4 w-full px-3 py-2 rounded-md bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={10} readOnly spellCheck={false} defaultValue={words} />

                {words.length > 0 &&
                    <button onClick={() => navigator.clipboard.writeText(words).then(() => copyAlert())} className="mt-4 w-full px-3 py-2 rounded-md bg-green-500 text-black hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer">
                        {!copied && 'Copiar texto'}
                        {copied && 'Texto copiado✅'}
                    </button>
                }
            </div>
        </Default>
    )
}
