import { MoneyIcon } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
import { Form } from "react-router"
import { useLockBodyScroll } from "~/hooks/useLockBodyScroll"

type TypeGeladeiraEditModal = {
  open: boolean
  fridgeId: string
  item: {
    id: string
    name: string
    quantity: number
    forSale: boolean
    priceCents: number | null
  } | null
  onClose: () => void
}


export function GeladeiraEditModal ({ open, item, onClose, fridgeId } : TypeGeladeiraEditModal) {

  useLockBodyScroll(open)

  return (
    <AnimatePresence>
      {open && item && (
        <Form method="post" key={`edit-modal-${item.id}`}>
          <input type="hidden" name="intent" value="update" />
          <input type="hidden" name="itemId" value={item.id} />
          <input type="hidden" name="fridgeId" value={fridgeId} />
          <motion.div
            className="fixed inset-0 bg-black/20 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed z-20 top-1/2 lg:left-1/2 left-0 w-[calc(100%-32px)] mx-4 lg:w-xl lg:-translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-black bg-white p-10 shadow-[4px_4px_0_#000000] space-y-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 22,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold">{item.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-bold">Quantidade</label>
                <input
                  name="quantity"
                  type="number"
                  min={0}
                  defaultValue={item.quantity}
                  className="h-11 w-full rounded-lg border-2 border-black px-3 font-bold shadow-[2px_2px_0_#000000] appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">Valor</label>
                <div className="relative">
                  <span className="absolute top-1/2 -translate-y-1/2 left-2.5 text-black font-bold">R$</span>
                  <input
                    name="price"
                    type="number"
                    min={0}
                    step={0.01}
                    defaultValue={
                      item.priceCents == null ? '' : (item.priceCents / 100).toFixed(2)
                    }
                    className="h-11 w-full rounded-lg border-2 border-black pl-6 pr-3 font-bold text-right shadow-[2px_2px_0_#000000] appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
            <label className="flex items-center justify-between gap-3 rounded-lg border-2 border-black bg-white px-4 py-3 shadow-[2px_2px_0_#000000]">
              <div className="flex items-center gap-3">
                <MoneyIcon className="h-5 w-5" weight="bold" />
                <span className="font-bold">Está à venda?</span>
              </div>
              <input
                name="forSale"
                type="checkbox"
                defaultChecked={item.forSale}
                className="h-5 w-5"
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
          </motion.div>
        </Form>
      )}
    </AnimatePresence>
  )
}