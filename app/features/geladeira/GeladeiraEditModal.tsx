import { MoneyIcon } from "@phosphor-icons/react"
import { Form } from "react-router"

type TypeGeladeiraEditModal = {
  open: boolean
  fridgeId: string
  item: {
    id: string
    name: string
    quantity: number
    forSale: boolean
    priceCents: number | null
  }
  onClose: () => void
}


export function GeladeiraEditModal ({ open, item, onClose, fridgeId } : TypeGeladeiraEditModal) {
  if (!open) return null
  return (
    <Form method="post">
      <input type="hidden" name="intent" value="update" />
      <input type="hidden" name="itemId" value={item.id} />
      <input type="hidden" name="fridgeId" value={fridgeId} />
      <div
        className="fixed inset-0 bg-black/20 z-10"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 z-20 w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-black bg-white p-10 shadow-[4px_4px_0_#000000] space-y-4">
        <h3 className="text-xl font-bold">{item.name}</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-bold">Quantidade</label>
            <input
              name="quantity"
              type="number"
              min={0}
              defaultValue={item.quantity}
              className="h-11 w-full rounded-lg border-2 border-black px-3 font-bold shadow-[2px_2px_0_#000000]"
            />
          </div>

          <div>
            <label className="block mb-1 font-bold">Valor</label>
            <input
              name="price"
              type="number"
              min={0}
              step={0.01}
              defaultValue={
                item.priceCents == null ? '' : (item.priceCents / 100).toFixed(2)
              }
              className="h-11 w-full rounded-lg border-2 border-black px-3 font-bold text-right shadow-[2px_2px_0_#000000]"
            />
          </div>
        </div>

        <label className="flex items-center justify-between rounded-lg border-2 border-black px-4 py-3 shadow-[2px_2px_0_#000000]">
          <span className="font-bold">Está à venda?</span>
          <input
            name="forSale"
            type="checkbox"
            defaultChecked={item.forSale}
          />
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-lg border-2 border-black font-bold shadow-[2px_2px_0_#000000]"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="flex-1 h-12 rounded-lg border-2 border-black bg-[#FFF129] font-bold shadow-[2px_2px_0_#000000]"
          >
            Salvar
          </button>
        </div>
      </div>
    </Form>
  )
}