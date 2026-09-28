// Мок-данные (потом заменим на реальный API)

const mockProgressData = {
  stats: {
    completedScenarios: 12,
    completedChange: 3,
    averageScore: 7.6,
    averageChange: 0.4,
    weakPoints: 2,
    weakPointsAttention: 1,
  },
  chartData: [
    { date: '1 апр', score: 4 },
    { date: '8 апр', score: 6.5 },
    { date: '15 апр', score: 7.2 },
    { date: '22 апр', score: 8.5 },
    { date: '29 апр', score: 9.8 },
    { date: '6 мая', score: 10.2 },
    { date: '13 мая', score: 10.6 },
  ],
  recentAttempts: [
    { date: '12 апр 2025', scenario: 'Обратная связь', score: 7 },
    { date: '8 апр 2025', scenario: 'Конфликт', score: 8 },
    { date: '29 мар 2025', scenario: 'Демотивация', score: 6 },
    { date: '5 мар 2025', scenario: 'Увольнение', score: 9 },
  ],
}

// Имитация запроса к серверу
export async function getProgressData() {
  // Имитируем задержку сети
  await new Promise(resolve => setTimeout(resolve, 400))

  // Потом здесь будет:
  // const response = await fetch('/api/progress')
  // return response.json()

  return mockProgressData
}