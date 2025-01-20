import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { createJSONStorage, persist } from "zustand/middleware"
import { preJoinSchema } from "@/lib/schemas/pre-join-schema"
import type { PreJoinFormData } from "@/lib/schemas/pre-join-schema"

interface PreJoinStore {
  formData: PreJoinFormData
  setFormData: (data: Partial<PreJoinFormData>) => void
  resetForm: () => void
}

const defaultValues: PreJoinFormData = {
  displayName: "",
  enableCamera: true,
  enableMicrophone: true,
  shareOnSocial: false,
}

export const usePreJoinStore = create<PreJoinStore>()(
  persist(
    immer((set) => ({
      formData: defaultValues,
      setFormData: (data) =>
        set((state) => {
          Object.assign(state.formData, data)
        }),
      resetForm: () =>
        set((state) => {
          state.formData = defaultValues
        }),
    })),
    {
      name: "pre-join-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

