// packages/builder/src/components/ManagementPanel.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotification } from "../context/NotificationContext";
import { useAdmin } from "../context/AdminContext";
import { useConfirm } from "../context/ConfirmationContext";

// Interfaces pour un typage plus strict et une meilleure lisibilité
interface ContentItem {
  name: string;
  path: string;
}
interface ContentGroup {
  id: string;
  label: string;
  items: ContentItem[];
}

interface ManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: any; // Utile pour la section "Collections"
}

export const ManagementPanel = ({
  isOpen,
  onClose,
  config,
}: ManagementPanelProps) => {
  // L'état est maintenant un simple tableau de groupes, il n'y a plus de "pages" ou "articles"
  const [contentGroups, setContentGroups] = useState<ContentGroup[]>([]);
  const router = useRouter();
  const { showNotification } = useNotification();
  const showConfirmationDialog = useConfirm();
  const { pathname: currentPathname } = useAdmin();
  const collectionSchemas = config.collectionSchemas || {};

  const fetchContent = async () => {
    try {
      const response = await fetch("/api/list-content");
      if (!response.ok)
        throw new Error("Impossible de charger la liste du contenu.");

      const data: ContentGroup[] = await response.json();

      // L'API renvoie maintenant des chemins publics. On ajoute /admin pour les liens du panneau.
      const adminData = data.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          path: "/admin" + item.path,
        })),
      }));

      setContentGroups(adminData);
    } catch (error: any) {
      showNotification(error.message, "error");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchContent();
    }
  }, [isOpen]);

  // La fonction `handleCreate` est maintenant générique et utilise l'ID du groupe
  const handleCreate = async (typeId: string, typeLabel: string) => {
    // On utilise la nouvelle fonctionnalité "prompt" de notre modale
    const name = await showConfirmationDialog({
      title: `Créer un(e) nouveau/nouvelle ${typeLabel.slice(0, -1)}`,
      message:
        "Veuillez entrer un nom pour ce nouveau contenu. Ce nom sera utilisé pour générer l'URL.",
      confirmText: "Créer",
      prompt: {
        label: "Nom du contenu",
        placeholder: "Ex: Mon premier article",
      },
    });

    // Si l'utilisateur a annulé (retourne false) ou n'a rien saisi, on arrête.
    if (name === false) return;

    try {
      const response = await fetch("/api/create-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type: typeId }), // On passe l'ID dynamique
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      showNotification(result.message, "success");
      onClose();
      router.push("/admin" + result.path);
    } catch (error: any) {
      showNotification(error.message, "error");
    }
  };

  const handleDelete = async (pathToDelete: string) => {
    // La confirmation simple fonctionne toujours de la même manière
    const isConfirmed = await showConfirmationDialog({
      title: "Confirmer la suppression",
      message:
        "Êtes-vous sûr de vouloir supprimer ce contenu ? Cette action est irréversible.",
      confirmText: "Supprimer",
    });

    // Sauf que la valeur de retour est une chaîne vide '' si confirmé, ou false si annulé
    if (isConfirmed === false) return;

    // On retire /admin du chemin pour l'API
    const publicPath = pathToDelete.replace("/admin", "") || "/";
    try {
      const response = await fetch("/api/delete-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathname: publicPath }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      showNotification(result.message, "success");
      // Si on supprime la page actuelle, on redirige vers l'accueil de l'admin
      if (currentPathname === publicPath) {
        router.push("/admin");
      } else {
        fetchContent(); // Sinon, on rafraîchit simplement la liste
      }
    } catch (error: any) {
      showNotification(error.message, "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-screen w-96 bg-gray-800 text-white shadow-2xl z-50 flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Gestion du Site</h2>
        <button onClick={onClose} className="text-2xl">
          &times;
        </button>
      </div>

      <div className="flex-grow overflow-y-auto space-y-6">
        {/* ==================================================================== */}
        {/* SECTION DE CONTENU 100% DYNAMIQUE */}
        {/* ==================================================================== */}
        {contentGroups.map((group) => (
          <div key={group.id}>
            <h3 className="font-semibold mb-2">{group.label}</h3>
            <div className="space-y-2">
              {group.items.map((item) => (
                <div
                  key={item.path}
                  className="flex justify-between items-center bg-gray-700 p-2 rounded"
                >
                  <Link
                    href={item.path}
                    onClick={onClose}
                    className="hover:underline truncate"
                    title={item.name}
                  >
                    {item.name}
                  </Link>
                  {/* On ne peut pas supprimer la page d'accueil */}
                  {item.path !== "/admin/" && (
                    <button
                      onClick={() => handleDelete(item.path)}
                      className="text-red-500 hover:text-red-400 text-xs flex-shrink-0 ml-2"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => handleCreate(group.id, group.label)}
                className="w-full text-left bg-blue-600 hover:bg-blue-500 p-2 rounded mt-2 text-sm"
              >
                + Nouveau / Nouvelle {group.label.slice(0, -1)}
              </button>
            </div>
          </div>
        ))}

        {/* SECTION COLLECTIONS (inchangée et toujours dynamique) */}
        {Object.keys(collectionSchemas).length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Collections</h3>
            <div className="space-y-2">
              <Link
                href="/admin/collections"
                onClick={onClose}
                className="block w-full text-left bg-gray-700 p-2 rounded hover:underline"
              >
                Gérer les Collections &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
