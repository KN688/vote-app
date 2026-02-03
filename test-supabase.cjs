// 测试Supabase连接
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umdbxzejxzlmtxskdacw.supabase.co';
const supabaseAnonKey = 'sb_publishable_Xd-E0EA4tC0_Je4vazzd5Q_V6Nkyso2';

console.log('测试 Supabase 连接...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 测试查询
async function testConnection() {
  try {
    console.log('1. 尝试查询 votes 表...');
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ 查询失败:', error.message);
      console.log('   错误代码:', error.code);
      console.log('   错误详情:', error.hint);
    } else {
      console.log('✅ 查询成功!');
      console.log('   返回数据:', data.length, '条记录');
      if (data.length > 0) {
        console.log('   示例数据:', JSON.stringify(data[0], null, 2));
      }
    }
  } catch (err) {
    console.log('❌ 连接异常:', err.message);
  }

  try {
    console.log('\n2. 检查表结构...');
    const { data, error } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.log('❌ 检查失败:', error.message);
    } else {
      console.log('✅ 表存在，记录数:', data || 0);
    }
  } catch (err) {
    console.log('❌ 异常:', err.message);
  }
}

testConnection();