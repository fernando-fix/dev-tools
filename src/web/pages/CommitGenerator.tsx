import { useState, useEffect } from 'react';
import Default from "../layouts/Default";

interface CommitType {
    value: string;
    emoji: string;
    label: string;
}

const commitTypes: CommitType[] = [
    { value: 'feat', emoji: '✨', label: 'feat' },
    { value: 'fix', emoji: '🐛', label: 'fix' },
    { value: 'docs', emoji: '📚', label: 'docs' },
    { value: 'refactor', emoji: '♻️', label: 'refactor' },
    { value: 'perf', emoji: '⚡', label: 'perf' },
    { value: 'style', emoji: '💄', label: 'style' },
    { value: 'test', emoji: '🧪', label: 'test' },
    { value: 'chore', emoji: '🔧', label: 'chore' },
];

export default function CommitGenerator() {
    const [selectedType, setSelectedType] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [commitMessage, setCommitMessage] = useState<string>('');
    const [gitCommand, setGitCommand] = useState<string>('');
    const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
    const [copiedCommand, setCopiedCommand] = useState<boolean>(false);

    useEffect(() => {
        if (selectedType && description) {
            const type = commitTypes.find(t => t.value === selectedType);
            if (type) {
                const message = `${type.emoji} ${type.value}: ${description}`;
                setCommitMessage(message);
                setGitCommand(`git commit -m "${message}"`);
            }
        } else {
            setCommitMessage('');
            setGitCommand('');
        }
    }, [selectedType, description]);

    const copyToClipboard = async (text: string, type: 'message' | 'command') => {
        try {
            await navigator.clipboard.writeText(text);
            
            if (type === 'message') {
                setCopiedMessage(true);
                setTimeout(() => setCopiedMessage(false), 1000);
            } else {
                setCopiedCommand(true);
                setTimeout(() => setCopiedCommand(false), 1000);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <Default pageTitle="🚀 Gerador de Commit Semântico">
            <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Tipo de Commit</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {commitTypes.map((type) => (
                            <div key={type.value} className="flex items-center">
                                <input
                                    type="radio"
                                    id={type.value}
                                    name="tipo"
                                    value={type.value}
                                    checked={selectedType === type.value}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="mr-2 text-blue-500 focus:ring-blue-500"
                                />
                                <label htmlFor={type.value} className="cursor-pointer">
                                    {type.emoji} {type.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Refatoração total do projeto"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <hr className="border-gray-700 mb-6" />

                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Mensagem do Commit</h3>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-black p-3 rounded-lg font-mono text-sm text-green-400 min-h-[50px] flex items-center">
                            {commitMessage || 'Selecione um tipo e digite uma descrição'}
                        </div>
                        <button
                            onClick={() => copyToClipboard(commitMessage, 'message')}
                            disabled={!commitMessage}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors flex items-center gap-2 min-w-[100px] justify-center cursor-pointer"
                        >
                            {copiedMessage ? (
                                <>
                                    <span className="text-green-400">✓</span>
                                    <span>Copiado!</span>
                                </>
                            ) : (
                                'Copiar'
                            )}
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-3">Comando Git</h3>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-black p-3 rounded-lg font-mono text-sm text-blue-400 min-h-[50px] flex items-center">
                            {gitCommand || 'Selecione um tipo e digite uma descrição'}
                        </div>
                        <button
                            onClick={() => copyToClipboard(gitCommand, 'command')}
                            disabled={!gitCommand}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors flex items-center gap-2 min-w-[100px] justify-center cursor-pointer"
                        >
                            {copiedCommand ? (
                                <>
                                    <span className="text-green-400">✓</span>
                                    <span>Copiado!</span>
                                </>
                            ) : (
                                'Copiar'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Default>
    );
}