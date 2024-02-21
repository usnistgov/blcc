import DataGrid from "react-data-grid";

type Row = {};

export default function LifecycleResultsComparison() {
    return (
        <div className={"w-full overflow-hidden rounded shadow-lg"}>
            <DataGrid
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                rows={[]}
                columns={[]}
                style={{
                    "--rdg-color-scheme": "light",
                    "--rdg-background-color": "#565C65",
                    "--rdg-row-hover-background-color": "#3D4551"
                }}
                rowClass={(_row: Row, index: number) => (index % 2 === 0 ? "bg-white" : "bg-base-lightest")}
                bottomSummaryRows={[]}
                rowGetter={[]}
                rowsCount={[].length}
            />
        </div>
    );
}
