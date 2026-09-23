import type { Artist } from '../data/types'
import { Modal } from './Modal'
import { Receipt } from './Receipt'

interface Props {
  artist: Artist
  onClose: () => void
  onPrint: () => void
}

/** 4-b. 내 결과를 영수증으로 출력하기 모달 */
export function ReceiptModal({ artist, onClose, onPrint }: Props) {
  return (
    <Modal title="내 결과를 영수증으로 출력하기" onClose={onClose}>
      <div className="modal__preview">
        <Receipt artist={artist} />
      </div>
      <div className="modal__actions">
        <button className="btn btn--primary btn--block" onClick={onPrint}>
          결과 출력하기
        </button>
      </div>
    </Modal>
  )
}
