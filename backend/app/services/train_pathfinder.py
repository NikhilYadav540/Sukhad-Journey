from collections import deque
from sqlalchemy.orm import Session

from app.models.reference import Station, StationOnLine
from app.schemas.reference import RouteResponse, RouteLeg

AVG_MINUTES_PER_STOP = 2.5
INTERCHANGE_PENALTY_MINUTES = 8
FARE_BASE = 5
FARE_PER_STOP = 1.2
INTERCHANGE_FARE_SURCHARGE = 5


def find_route(db: Session, origin_name: str, destination_name: str) -> RouteResponse | None:
    origin = db.query(Station).filter(Station.name.ilike(origin_name)).first()
    destination = db.query(Station).filter(Station.name.ilike(destination_name)).first()
    if not origin or not destination:
        return None

    links = db.query(StationOnLine).order_by(StationOnLine.line_id, StationOnLine.sequence).all()
    by_line: dict[int, list[StationOnLine]] = {}
    for link in links:
        by_line.setdefault(link.line_id, []).append(link)

    adjacency: dict[int, list[tuple[int, str]]] = {}
    for line_id, stops in by_line.items():
        line_name = stops[0].line.name
        for i in range(len(stops) - 1):
            a, b = stops[i].station_id, stops[i + 1].station_id
            adjacency.setdefault(a, []).append((b, line_name))
            adjacency.setdefault(b, []).append((a, line_name))

    start, goal = origin.id, destination.id
    queue = deque([(start, None, [])])
    visited = set()

    while queue:
        station_id, current_line, path = queue.popleft()
        if station_id == goal:
            return _build_response(db, origin.name, destination.name, path)
        state = (station_id, current_line)
        if state in visited:
            continue
        visited.add(state)
        for neighbor_id, line_name in adjacency.get(station_id, []):
            queue.append((neighbor_id, line_name, path + [(station_id, neighbor_id, line_name)]))

    return None


def _build_response(db: Session, origin_name: str, destination_name: str, path: list[tuple[int, int, str]]) -> RouteResponse:
    if not path:
        # origin == destination
        return RouteResponse(
            origin=origin_name, destination=destination_name, line="Same station",
            interchange=None, legs=[], estimatedMins=0, fare=0,
        )

    legs: list[RouteLeg] = []
    current_line = path[0][2]
    seg_start = path[0][0]
    stop_count = 0
    for from_id, to_id, line_name in path:
        if line_name != current_line:
            legs.append(_build_leg(db, current_line, seg_start, from_id, stop_count))
            current_line = line_name
            seg_start = from_id
            stop_count = 0
        stop_count += 1
    legs.append(_build_leg(db, current_line, seg_start, path[-1][1], stop_count))

    total_stops = sum(leg.num_stops for leg in legs)
    interchange_count = len(legs) - 1
    duration = round(total_stops * AVG_MINUTES_PER_STOP + interchange_count * INTERCHANGE_PENALTY_MINUTES)
    
    # Calculate realistic Mumbai local train fare (multiples of 5)
    if total_stops == 0:
        fare = 0
    elif total_stops <= 4:
        fare = 5
    elif total_stops <= 10:
        fare = 10
    elif total_stops <= 20:
        fare = 15
    elif total_stops <= 35:
        fare = 20
    else:
        fare = 25

    if interchange_count > 0:
        fare += 5


    line_display = " -> ".join(dict.fromkeys(leg.line for leg in legs))  # de-duped, ordered
    interchange_msg = None
    if interchange_count > 0:
        change_points = [leg.to_station for leg in legs[:-1]]
        interchange_msg = f"Change train at {' / '.join(change_points)}"

    return RouteResponse(
        origin=origin_name, destination=destination_name, line=line_display,
        interchange=interchange_msg, legs=legs, estimatedMins=duration, fare=fare,
    )


def _build_leg(db: Session, line_name: str, from_id: int, to_id: int, num_stops: int) -> RouteLeg:
    from_station = db.query(Station).get(from_id)
    to_station = db.query(Station).get(to_id)
    return RouteLeg(
        line=line_name,
        from_station=from_station.name if from_station else "?",
        to_station=to_station.name if to_station else "?",
        num_stops=num_stops,
    )
