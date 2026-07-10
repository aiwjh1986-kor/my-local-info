import { getSortedTipsData } from "@/lib/posts";
import TipsListClient from "./TipsListClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "루미의 실생활 꿀팁 모음 | 생활의 지혜",
  description: "주방 청소부터 수납 정리까지, 루미가 엄선한 실생활 알짜배기 꿀팁들을 한눈에 모아보세요.",
};

export default function TipsPage() {
  const allTips = getSortedTipsData();
  return <TipsListClient allTips={allTips} />;
}
