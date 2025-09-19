import DataTableCard from "./DataTableCard";
import PlotCard from "./PlotCard";
import SliderCard from "./SliderCard";
import StatisticsCard from "./StatisticsCard";

function App() {
  return (
    <div className="app-container">
      <h1>Shiny React Output Examples</h1>
      <div className="cards-wrap">
        <SliderCard />
        <StatisticsCard />
        <DataTableCard />
        <PlotCard />
      </div>
    </div>
  );
}

export default App;
