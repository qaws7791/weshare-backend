/**
 * 예약 가능한 타임 슬롯들을 생성합니다. 현재 시간으로부터 가장 가까운 30분 단위 시간부터 시작하여 30분 단위로 7일 후 자정까지의 타임 슬롯을 생성합니다.
 *
 */
export const generateTimeSlots = (): {
  startTime: Date;
  endTime: Date;
  duration: number;
}[] => {
  // startTime은 현재 시간으로부터 가장 가까운 30분 단위 시간으로 설정합니다.
  // 예를 들어 현재 시간이 2023-10-01 14:15:00이라면 startTime은 2023-10-01 14:30:00이 됩니다.
  // 2023-10-01 14:58:00이면 2023-10-01 15:00:00이 됩니다.

  const now = new Date();
  const minutes = now.getMinutes();
  const startMinutes = Math.ceil(minutes / 30) * 30;
  const startTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    startMinutes,
    0,
    0,
  );

  // endTime은 startTime으로부터 7일 후 자정까지의 시간을 설정합니다.
  // 예를 들어 startTime이 2023-10-01 14:30:00이라면 endTime은 2023-10-08 00:00:00이 됩니다.
  const endTime = new Date(
    startTime.getFullYear(),
    startTime.getMonth(),
    startTime.getDate() + 7,
    0,
    0,
    0,
    0,
  );

  // startTime과 endTime 사이의 30분 단위 슬롯을 생성합니다.
  const timeSlots = Array.from(
    {
      length: Math.ceil(
        (endTime.getTime() - startTime.getTime()) / (30 * 60 * 1000),
      ),
    },
    (_, i) => {
      const start = new Date(startTime.getTime() + i * 30 * 60 * 1000);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      return {
        startTime: start,
        endTime: end,
        duration: 30,
      };
    },
  );
  return timeSlots;
};

export const validateReservationTime = (
  startTime: Date,
  endTime: Date,
): boolean => {
  const now = new Date();
  const startTimeDate = new Date(startTime);
  const endTimeDate = new Date(endTime);
  const startTimeMinutes = startTimeDate.getMinutes();
  const endTimeMinutes = endTimeDate.getMinutes();
  const startTimeSeconds = startTimeDate.getSeconds();
  const endTimeSeconds = endTimeDate.getSeconds();
  const startTimeMilliseconds = startTimeDate.getMilliseconds();
  const endTimeMilliseconds = endTimeDate.getMilliseconds();
  const availableMaxEndTime = new Date(
    startTimeDate.getFullYear(),
    startTimeDate.getMonth(),
    startTimeDate.getDate() + 7,
    0,
    0,
    0,
    0,
  );

  //  두 가지 시간 모두 0초인지 확인
  if (
    startTimeSeconds !== 0 ||
    startTimeMilliseconds !== 0 ||
    endTimeSeconds !== 0 ||
    endTimeMilliseconds !== 0
  ) {
    return false;
  }

  // 두 가지 시간 모두 0분 0초 또는 30분 0초인지 확인
  if (
    (startTimeMinutes !== 0 && startTimeMinutes !== 30) ||
    (endTimeMinutes !== 0 && endTimeMinutes !== 30)
  ) {
    return false;
  }

  // 예약 시작 시간이 현재 시간보다 이전인지 확인합니다.
  if (startTimeDate < now) {
    return false;
  }

  // 예약 종료 시간이 예약 시작 시간보다 이전이거나 7일 초과인 경우 확인합니다.
  if (endTimeDate <= startTimeDate || endTimeDate > availableMaxEndTime) {
    return false;
  }

  // 예약 시작 시간이 예약 종료 시간보다 이후인지 확인합니다.
  if (startTimeDate >= endTimeDate) {
    return false;
  }

  return true;
};
