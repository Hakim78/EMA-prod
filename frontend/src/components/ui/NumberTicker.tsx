"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Props {
  value: number;
  style?: React.CSSProperties;
}

export default function NumberTicker({ value, style }: Props) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 160, damping: 30, mass: 0.7 });
  const display = useTransform(spring, (v) => Math.round(v).toString());

  useEffect(() => {
    mv.set(value);
  }, [mv, value]);

  return <motion.span style={style}>{display}</motion.span>;
}
