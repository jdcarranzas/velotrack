"use client";
import { useMemo, useState } from "react";

import { useTalentCatalogs } from "@/hooks/data/useTalentCatalogs";
import { toApiError } from "@/hooks/useAsyncData";
import type { Category } from "@/models/talent.model";

import CategoryFormModal from "./CategoryFormModal";
import CategoryListComponent from "./categoryList.component";

const CategoryListContainer = () => {
  const {
    catalogs,
    isLoading,
    error,
    createCategory,
    updateCategory,
    setCategoryActive,
  } = useTalentCatalogs();
  const [includeInactive, setIncludeInactive] = useState(false);
  // undefined: cerrado; null: nueva; Category: editar
  const [editing, setEditing] = useState<Category | null | undefined>();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      catalogs.categories
        .filter((category) => includeInactive || category.isActive)
        .sort((a, b) => a.name.localeCompare(b.name, "es")),
    [catalogs.categories, includeInactive],
  );

  const toggle = async (category: Category) => {
    setPendingId(category.id);
    setActionError(null);
    try {
      await setCategoryActive(category.id, !category.isActive);
    } catch (caught) {
      setActionError(toApiError(caught).message);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <>
      <CategoryListComponent
        categories={categories}
        isLoading={isLoading}
        error={error}
        actionError={actionError}
        includeInactive={includeInactive}
        pendingId={pendingId}
        onIncludeInactiveChange={setIncludeInactive}
        onCreate={() => setEditing(null)}
        onEdit={setEditing}
        onToggle={toggle}
      />
      {editing !== undefined && (
        <CategoryFormModal
          category={editing}
          onSubmit={(input) =>
            editing ? updateCategory(editing.id, input) : createCategory(input)
          }
          onClose={() => setEditing(undefined)}
        />
      )}
    </>
  );
};

export default CategoryListContainer;
