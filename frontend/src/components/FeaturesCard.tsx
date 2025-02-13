import { Card } from "antd";
import Title from "antd/es/typography/Title";

export type FeaturesCardProps = {
    image: string,
    headerText: string,
    line1: string,
    line2?: string,
    alt: string
}

export default function FeaturesCard({image, headerText, line1, line2, alt}: FeaturesCardProps) {
    return (
        <Card className="m-8 w-1/3 shadow-md">
            <div className="flex flex-col items-center">
                <img src={image} className="w-20" alt={alt}/>
                <Title level={3} className="my-2">{headerText}</Title>
                <p className="text-center">{line1}</p>
                <p className="text-center">{line2}</p>
            </div>
        </Card>
    );
}