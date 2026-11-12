from app.models import PilotLevel

# Matriz de teto de velocidade por nível de pilotagem (km/h)
SPEED_LIMIT_MAP = {
    PilotLevel.INICIANTE: 100,
    PilotLevel.AMADOR: 160,
    PilotLevel.INTERMEDIARIO: 220,
    PilotLevel.AVANCADO: 280,
    PilotLevel.PROFISSIONAL: 999  # Sem limite eletrônico
}


def calculate_effective_speed_limit(bike_base_top_speed: int, pilot_level: PilotLevel) -> int:
    """
    Calcula a velocidade máxima que a motocicleta terá liberada na pista.
    Regra: MIN(Velocidade Máxima da Moto, Teto do Nível do Piloto)
    """
    pilot_max_allowed = SPEED_LIMIT_MAP.get(pilot_level, 100)
    return min(bike_base_top_speed, pilot_max_allowed)
