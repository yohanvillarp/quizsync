import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { apiClient } from "@/shared/api/apiClient";
import { useAlertStore } from "@/shared/store/useAlertStore";

interface Category {
  id: string;
  name: string;
  description: string;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const { showAlert } = useAlertStore();

  const fetchCategories = () => {
    setIsLoading(true);
    apiClient.get('/quizzes/categories')
      .then(res => setCategories(res.data))
      .catch(err => {
        console.error("Error al cargar categorías", err);
        showAlert("No se pudieron cargar las categorías.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatDesc.trim()) return;

    try {
      const res = await apiClient.post('/quizzes/categories', {
        name: newCatName,
        description: newCatDesc
      });
      setCategories([...categories, res.data]);
      setNewCatName("");
      setNewCatDesc("");
      showAlert("¡Categoría creada exitosamente!", "Éxito");
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 409) {
        showAlert("Ya existe una categoría con este nombre.", "Nombre duplicado");
      } else {
        showAlert("Hubo un error al crear la categoría.");
      }
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center p-8 z-10 w-full animate-in fade-in duration-300">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        
        <header className="flex justify-between items-end border-b-4 border-dashed border-[var(--color-ink)] pb-6">
          <div>
            <h1 className="font-headline text-5xl font-black tracking-tight uppercase">Categorías</h1>
            <p className="font-body text-xl font-bold text-gray-600 mt-2">Gestiona y crea nuevas temáticas para los cuestionarios.</p>
          </div>
        </header>

        <section className="bg-white border-4 border-[var(--color-ink)] rounded-2xl p-6 shadow-[8px_8px_0px_0px_var(--color-ink)] flex flex-col gap-4">
          <h2 className="font-headline text-2xl font-bold border-b-2 border-[var(--color-ink)] pb-2 mb-2">Crear Nueva Categoría</h2>
          <form onSubmit={handleCreateCategory} className="flex gap-4 items-end">
            <div className="flex flex-col gap-2 flex-grow">
              <label className="font-bold">Nombre</label>
              <input 
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                required 
                className="border-2 border-[var(--color-ink)] p-3 rounded-xl focus:outline-none focus:ring-4 ring-[var(--color-high-yellow)] font-body text-lg" 
                placeholder="Ej: Geografía" 
              />
            </div>
            <div className="flex flex-col gap-2 flex-grow">
              <label className="font-bold">Descripción</label>
              <input 
                value={newCatDesc}
                onChange={e => setNewCatDesc(e.target.value)}
                required 
                className="border-2 border-[var(--color-ink)] p-3 rounded-xl focus:outline-none focus:ring-4 ring-[var(--color-high-yellow)] font-body text-lg" 
                placeholder="Ej: Preguntas sobre países y capitales" 
              />
            </div>
            <button 
              type="submit"
              className="flex items-center justify-center h-[56px] gap-2 bg-[var(--color-high-pink)] border-4 border-[var(--color-ink)] px-6 rounded-xl font-headline font-bold text-lg hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_var(--color-ink)] transition-all">
              <PlusCircle size={24} />
              Crear
            </button>
          </form>
        </section>

        {isLoading ? (
          <div className="p-8 text-center font-bold text-xl animate-pulse">Cargando categorías...</div>
        ) : (
          <div className="grid grid-cols-2 gap-6 mt-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-[var(--color-paper-dim)] border-4 border-[var(--color-ink)] rounded-2xl shadow-[6px_6px_0px_0px_var(--color-ink)] p-6 flex flex-col gap-2">
                <h3 className="font-headline text-2xl font-bold text-[var(--color-ink)]">{cat.name}</h3>
                <p className="text-gray-700 font-body">{cat.description || "Sin descripción"}</p>
              </div>
            ))}
            {categories.length === 0 && (
               <p className="col-span-2 text-center text-gray-500 font-bold italic py-8">No hay categorías registradas.</p>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
