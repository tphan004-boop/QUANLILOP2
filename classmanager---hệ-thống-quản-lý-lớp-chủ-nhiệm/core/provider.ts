
import { GasProvider } from '../providers/gasProvider';
import { IDataProvider } from './dataProvider';

// Chuyển từ MockProvider sang GasProvider để sử dụng Backend Google Sheet thực tế
const provider: IDataProvider = new GasProvider();

export default provider;
