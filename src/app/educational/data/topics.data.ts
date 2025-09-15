// src/app/educational/data/topics.data.ts
import type { ITopic } from "@/types/topics.type";

import bitcoin from "@/app/educational/img/bitcoin.jpg";
import blockchain from "@/app/educational/img/blockchain.png";
import carteiras from "@/app/educational/img/carteiras.png";
import criptomoedas from "@/app/educational/img/criptomoedas.png";
import ethereum from "@/app/educational/img/ethereum.png";
import gestaoRisco from "@/app/educational/img/gestao-risco.png";
import comoComprar from "@/app/educational/img/como-comprar.png";
import nfts from "@/app/educational/img/nfts.png";
import stablecoins from "@/app/educational/img/stablecoins.png";

export const EDUCATIONAL_TOPICS: ITopic[] = [
  {
    slug: "o-que-sao-criptomoedas",
    title: "O que são Criptomoedas?",
    img: criptomoedas,
  },
  {
    slug: "como-funciona-a-blockchain",
    title: "Como funciona a Blockchain?",
    img: blockchain,
  },
  {
    slug: "saiba-mais-sobre-bitcoin",
    title: "Saiba mais sobre o Bitcoin",
    img: bitcoin,
  },
  {
    slug: "smart-contracts",
    title: "Ethereum e a ideia de “smart contracts”",
    img: ethereum,
  },
  { slug: "tipos-de-carteiras", title: "Tipos de carteiras", img: carteiras },
  {
    slug: "como-comprar-criptomoedas",
    title: "Como comprar criptomoedas",
    img: comoComprar,
  },
  { slug: "nfts", title: "NFTs", img: nfts },
  {
    slug: "volatilidade-e-gestao-de-risco",
    title: "Volatilidade e gestão de risco",
    img: gestaoRisco,
  },
  { slug: "stablecoins", title: "Stablecoins", img: stablecoins },
];
