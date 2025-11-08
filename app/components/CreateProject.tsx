"use client";

import React, { useState } from 'react';

interface CreateProjectData {
  title: string;
  description: string;
  type: 'IA' | 'GRAFICA';
  price: number;
  wallet_address: string;
  cloud_link: string;
  external_links?: string[]; // Array para múltiplos links externos
  attachment_info?: string; // Informações sobre o anexo
}

interface Props {
  initial?: Partial<CreateProjectData>;
  onCancel: () => void;
  // O onSubmit agora também envia o arquivo
  onSubmit: (data: CreateProjectData, file: File | null) => void;
  loading?: boolean;
  isEditing?: boolean;
}

export default function CreateProject({ initial = {}, onCancel, onSubmit, loading = false, isEditing = false }: Props) {
  const [formData, setFormData] = useState<CreateProjectData>({
    title: initial.title || '',
    description: initial.description || '',
    type: (initial.type as 'IA' | 'GRAFICA') || 'IA',
    price: initial.price || 0,
    wallet_address: initial.wallet_address || '',
    cloud_link: (initial as any).cloud_link || '',
    external_links: (initial as any).external_links || [],
    attachment_info: (initial as any).attachment_info || ''
  });
  
  // Estado para o arquivo
  const [scriptFile, setScriptFile] = useState<File | null>(null);
  
  // Estado para novo link sendo adicionado
  const [newLink, setNewLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Envia os dados E o arquivo
    onSubmit(formData, scriptFile);
  };

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      {/* ... (título do formulário) ... */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... (campos title, description, type, price) ... */}

        {/* Link da Nuvem */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Link do Dataset/Blend (Nuvem)
          </label>
          <input
            type="url"
            placeholder="http://example.com/dataset.zip"
            value={formData.cloud_link}
            onChange={(e) => setFormData({ ...formData, cloud_link: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Links Externos Adicionais */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Links Externos
          </label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="url"
                placeholder="Adicionar novo link"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2"
              />
              <button
                type="button"
                onClick={() => {
                  if (newLink) {
                    setFormData({
                      ...formData,
                      external_links: [...(formData.external_links || []), newLink]
                    });
                    setNewLink('');
                  }
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                +
              </button>
            </div>
            {formData.external_links && formData.external_links.length > 0 && (
              <div className="space-y-2">
                {formData.external_links.map((link, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1 text-blue-600 truncate">
                      {link}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          external_links: formData.external_links?.filter((_, i) => i !== index)
                        });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Anexo do Script */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Script ou Arquivos Adicionais
          </label>
          <div className="space-y-2">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                setScriptFile(file);
                if (file) {
                  setFormData({
                    ...formData,
                    attachment_info: `${file.name} (${(file.size / 1024).toFixed(1)}KB)`
                  });
                }
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formData.attachment_info && (
              <p className="text-sm text-gray-600">
                Arquivo selecionado: {formData.attachment_info}
              </p>
            )}
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors"
            disabled={loading}
          >
            {isEditing ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </form>
    </div>
  );
}
