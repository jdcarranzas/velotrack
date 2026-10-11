import Button from "@/components/atoms/Button";
import TextInput from "@/components/atoms/TextInput";
import FormActions from "@/components/molecules/FormActions";
import FormError from "@/components/molecules/FormError";
import FormField from "@/components/molecules/FormField";
import FormGrid from "@/components/molecules/FormGrid";
import Modal from "@/components/molecules/Modal";
import { useForm } from "@/hooks/useForm";
import { useSubmit } from "@/hooks/useSubmit";
import type { Category, CategoryInput } from "@/models/talent.model";
import { categoryFormSchema } from "@/models/talent.schema";
import { apiToFieldErrors } from "@/utils/helpers/forms";

export type CategoryFormModalProps = {
  // Sin category es una categoría nueva
  category: Category | null;
  onSubmit: (input: CategoryInput) => Promise<void>;
  onClose: () => void;
};

// Crear (POST /api/categories) o editar (PUT /api/categories/{id})
const CategoryFormModalContainer = ({
  category,
  onSubmit,
  onClose,
}: CategoryFormModalProps) => {
  const { values, errors, setValue, setErrors, validate } = useForm(
    categoryFormSchema,
    { name: category?.name ?? "", description: category?.description ?? "" },
  );
  const { submit, isSubmitting, error } = useSubmit(onSubmit);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const input = validate();
    if (!input) return;
    const result = await submit(input);
    if (result.ok) onClose();
    else setErrors(apiToFieldErrors(result.error.fieldErrors));
  };

  return (
    <Modal
      title={category ? "Editar categoría" : "Nueva categoría"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormGrid columns={1}>
          <FormField label="Nombre" htmlFor="category-name" error={errors.name}>
            <TextInput
              id="category-name"
              value={values.name}
              invalid={!!errors.name}
              placeholder="Juvenil"
              onChange={(event) => setValue("name", event.target.value)}
            />
          </FormField>
          <FormField
            label="Descripción"
            htmlFor="category-description"
            optional
          >
            <TextInput
              id="category-description"
              value={values.description}
              placeholder="De 14 a 16 años"
              onChange={(event) => setValue("description", event.target.value)}
            />
          </FormField>
        </FormGrid>

        <FormError error={error} />

        <FormActions>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar categoría"}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
};

export default CategoryFormModalContainer;
