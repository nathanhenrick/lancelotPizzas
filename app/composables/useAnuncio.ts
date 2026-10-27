export const useAnuncio = () => {
  const mensagem = useState('anuncio', () => '')

  const anunciar = (texto: string) => {
    mensagem.value = ''
    nextTick(() => { mensagem.value = texto })
  }

  return { mensagem, anunciar }
}
