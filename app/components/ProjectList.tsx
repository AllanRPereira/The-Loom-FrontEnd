"use client";

import React from 'react';

interface Project {
  id: number;
  title: string;
  description: string;
  type: 'IA' | 'GRAFICA';
  price: number;
  wallet_address: string;
  status: 'PENDING' | 'WORKING' | 'COMPLETED';
  progress: number;
  created_at: string;
  cloud_link?: string;
  script_path?: string;
  external_links?: string[];
  attachment_info?: string;
}

interface Props {
  projects: Project[];
  onEdit: (p: Project) => void;
  onStart: (p: Project) => void;
  onDelete: (id: number) => void;
  onUpdateProgress?: (id: number, progress: number) => void;
}

export default function ProjectList({ projects, onEdit, onStart, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => (
        <div key={p.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          {/* Cabeçalho com Título e Tipo */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex-1">{p.title}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              p.type === 'IA' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {p.type}
            </span>
          </div>

          {/* Status e Progresso */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                p.status === 'WORKING' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {p.status}
              </span>
              <span className="text-sm text-gray-600 font-medium">{p.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  p.status === 'COMPLETED' ? 'bg-green-500' :
                  p.status === 'WORKING' ? 'bg-blue-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${p.progress}%` }}
              />
            </div>
          </div>

          {/* Descrição */}
          {p.description && (
            <p className="text-sm text-gray-700 mb-4">{p.description}</p>
          )}

          {/* Links e Anexos */}
          <div className="space-y-3 mb-4">
            {/* Dataset Link */}
            {p.cloud_link && (
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">Dataset/Blend:</p>
                  <a
                    href={p.cloud_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 break-all"
                  >
                    {p.cloud_link}
                  </a>
                </div>
              </div>
            )}

            {/* Script Path */}
            {p.script_path && (
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">Script:</p>
                  <code className="text-sm bg-gray-50 rounded px-2 py-1 font-mono text-gray-800">
                    {p.script_path}
                  </code>
                </div>
              </div>
            )}

            {/* External Links */}
            {p.external_links && p.external_links.length > 0 && (
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">Links Adicionais:</p>
                  <div className="space-y-1">
                    {p.external_links.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-green-600 hover:text-green-800 break-all"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Attachment Info */}
            {p.attachment_info && (
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">Anexo:</p>
                  <p className="text-sm text-gray-600">{p.attachment_info}</p>
                </div>
              </div>
            )}
          </div>

          {/* Preço */}
          <div className="mb-4">
            <span className="text-2xl font-bold text-gray-900">${p.price.toFixed(2)}</span>
            <span className="text-gray-600 text-sm ml-1">USDC</span>
          </div>

          {/* Ações */}
          <div className="flex space-x-2">
            {p.status === 'PENDING' && (
              <button
                onClick={() => onStart(p)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                Iniciar
              </button>
            )}
            <button
              onClick={() => onEdit(p)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded font-medium transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(p.id)}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded font-medium transition-colors"
            >
              Deletar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}