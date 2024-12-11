import DashboardFilter from "./DashboardFilter";
import DashboardLayout from "./DashboardLayout";
import Heading from "../../_components/Heading";
import Row from "../../_components/Row";
import withAuth from "@/app/_utils/withAuth";
function Page() {
  return (
    <>
    <withAuth>
      <Row type="horizontal">
        <Heading as="h1">Dashboard</Heading>
        <DashboardFilter />
      </Row>

      <DashboardLayout />
    </withAuth>
    </>
  );
}

export default Page;
