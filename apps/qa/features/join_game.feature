Feature: Unirse a una partida
  Como jugador
  Quiero poder unirme a una sesión de juego activa usando un PIN
  Para poder participar en el cuestionario

  Scenario: Un jugador se une a una sala válida
    Given que el anfitrión ha creado una sala
    When el jugador ingresa el PIN de la sala y su nombre "Yohan"
    Then el jugador debe ver la pantalla de "Esperando al anfitrión"
