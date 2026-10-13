import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="panel center">
        <h1>존재하지 않는 사건입니다.</h1>
        <Link className="btn" to="/">사건 목록으로</Link>
      </div>
    </Layout>
  );
}
