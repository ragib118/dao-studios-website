type StatCardProps = {
    value: string;
    label: string;
};

export default function StatCard({
    value,
    label,
}: StatCardProps) {
    return (
        <article className="statCard">
            <h3 className="statValue">
                {value}
            </h3>

            <p className="statLabel">
                {label}
            </p>
        </article>
    );
}