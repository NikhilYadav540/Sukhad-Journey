from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class TrainLine(Base):
    __tablename__ = "train_lines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(40), nullable=False)  # Western, Central, Harbour

    stations = relationship("StationOnLine", back_populates="line", order_by="StationOnLine.sequence")


class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), unique=True, nullable=False, index=True)
    display_line = Column(String(80), nullable=True)  # e.g. "Interchange (Western & Central)" — matches frontend dropdown text
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_hub = Column(Integer, default=0)  # 0/1, matches MUMBAI_STATIONS "hub" flag


class StationOnLine(Base):
    """Join table giving each station its sequence position on a given line."""
    __tablename__ = "stations_on_line"

    id = Column(Integer, primary_key=True, index=True)
    line_id = Column(Integer, ForeignKey("train_lines.id"), nullable=False)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    sequence = Column(Integer, nullable=False)

    line = relationship("TrainLine", back_populates="stations")
    station = relationship("Station")
