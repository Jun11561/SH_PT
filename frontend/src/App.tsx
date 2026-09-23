import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AudioProvider } from './hooks/useAudioPlayer'
import { ArtistSelectPage } from './pages/ArtistSelectPage'
import { DonePage } from './pages/DonePage'
import { IntroPage } from './pages/IntroPage'
import { PrintingPage } from './pages/PrintingPage'
import { ResultPage } from './pages/ResultPage'

/**
 * 화면 흐름
 * /            시작 안내 (NFC 태깅 후 첫 화면)
 * /select      아티스트 추천 캐러셀
 * /result/:id  결과 화면 (+ 사진 저장 / 영수증 모달)
 * /printing    출력중
 * /done        완료
 */
export default function App() {
  return (
    <BrowserRouter>
      <AudioProvider>
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/select" element={<ArtistSelectPage />} />
          <Route path="/result/:artistId" element={<ResultPage />} />
          <Route path="/printing" element={<PrintingPage />} />
          <Route path="/done" element={<DonePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AudioProvider>
    </BrowserRouter>
  )
}
