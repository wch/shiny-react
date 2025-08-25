import SliderCard from "./SliderCard";
import DataTableCard from "./DataTableCard";
import StatisticsCard from "./StatisticsCard";
import PlotCard from "./PlotCard";

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
