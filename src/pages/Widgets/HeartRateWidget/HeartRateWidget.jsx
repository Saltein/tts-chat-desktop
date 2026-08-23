import { useWebSocket } from "../../../shared/hooks/useWebSocket";
import s from "./HeartRateWidget.module.scss";
import { useMemo } from "react";
import HeartIcon from "../../../shared/assets/icons/heart.svg?react";

// Расширенная конфигурация
const BPM_CONFIG = {
	// Диапазон BPM
	MIN_BPM: 60,
	MAX_BPM: 130,
	DEFAULT_BPM: 80,
	
	// Настройки фильтров (значения от 0 до 1)
	FILTER: {
		// Для saturate: min (бледный) и max (яркий)
		SATURATE_MIN: 0,
		SATURATE_MAX: 1.0,
		
		// Для brightness: max (светлый) и min (темный)
		BRIGHTNESS_MIN: 1,
		BRIGHTNESS_MAX: 2,
		
		// Для тени: min и max интенсивность
		SHADOW_MIN: 0.2,
		SHADOW_MAX: 1.0,
	},
};

export const HeartRateWidget = () => {
	const { isConnected, messages } = useWebSocket("heart-rate", "widget-user");

	const heartRate = useMemo(() => {
		const systemMessages = messages.filter((msg) => msg.user === "system");
		if (systemMessages.length === 0) return null;
		return systemMessages[systemMessages.length - 1].text;
	}, [messages]);

	const beatParams = useMemo(() => {
		const { MIN_BPM, MAX_BPM, DEFAULT_BPM, FILTER } = BPM_CONFIG;
		const { SATURATE_MIN, SATURATE_MAX, BRIGHTNESS_MAX, BRIGHTNESS_MIN, SHADOW_MIN, SHADOW_MAX } = FILTER;

		if (!heartRate) {
			return {
				duration: "1s",
				filter: `saturate(${SATURATE_MIN}) brightness(${BRIGHTNESS_MAX})`,
				shadowColor: `rgba(255, 33, 33, ${SHADOW_MIN})`,
				bpm: DEFAULT_BPM,
				intensity: 0,
			};
		}

		const bpm = parseInt(heartRate);
		if (isNaN(bpm) || bpm === 0) {
			return {
				duration: "1s",
				filter: `saturate(${SATURATE_MIN}) brightness(${BRIGHTNESS_MAX})`,
				shadowColor: `rgba(255, 33, 33, ${SHADOW_MIN})`,
				bpm: DEFAULT_BPM,
				intensity: 0,
			};
		}

		const duration = `${60 / bpm}s`;
		const clampedBpm = Math.max(MIN_BPM, Math.min(MAX_BPM, bpm));
		
		// Нормализуем от 0 до 1
		const intensity = (clampedBpm - MIN_BPM) / (MAX_BPM - MIN_BPM);
		
		// Интерполяция значений
		const saturate = SATURATE_MIN + intensity * (SATURATE_MAX - SATURATE_MIN);
		const brightness = BRIGHTNESS_MAX - intensity * (BRIGHTNESS_MAX - BRIGHTNESS_MIN);
		const shadowIntensity = SHADOW_MIN + intensity * (SHADOW_MAX - SHADOW_MIN);

        const colorSaturate = 255 - Math.round(saturate * 255)
		const shadowColor = `rgba(255, ${colorSaturate}, ${colorSaturate}, ${shadowIntensity})`;

		return {
			duration,
			filter: `saturate(${saturate}) brightness(${brightness})`,
			shadowColor,
			bpm: clampedBpm,
			intensity,
            saturate
		};
	}, [heartRate]);

	// Опционально: показываем текущий BPM и интенсивность для отладки
	const debugInfo = process.env.NODE_ENV === 'development' ? (
		<div className={s.debug}>
			{beatParams.bpm} BPM | {Math.round(beatParams.intensity * 100)}%
		</div>
	) : null;


	return (
		<div className={s.wrapper}>
			<div className={s.block}>
				<div
					className={s.iconWrapper}
					style={{
						"--beat-duration": beatParams.duration,
						"--heart-filter": beatParams.filter,
						"--shadow-color": beatParams.shadowColor,
					}}
				>
					<HeartIcon className={s.icon} />
				</div>
				<div className={s.title}>
					{isConnected
						? heartRate || "Ожидание данных..."
						: "Подключение к серверу..."}
				</div>
				{/* {debugInfo} */}
			</div>
		</div>
	);
};